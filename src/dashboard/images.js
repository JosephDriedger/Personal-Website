const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const { UPLOAD_DIR, UPLOAD_URL } = require("../config/uploads");
const { slugify } = require("./validation");

/*
Uploaded files are never stored as received. Each one is decoded, checked to be a
real raster image, auto-rotated, stripped of metadata (EXIF/GPS), and re-encoded as
WebP, plus a thumbnail. The stored name is generated here, never taken from the client.
*/

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);
const MAX_PIXELS = 40 * 1000 * 1000;
const MAIN_SIZE = 1920;
const THUMB_SIZE = 640;

const STORED_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;

class ImageError extends Error {}

async function processImage(buffer, label)
{
    let format;

    try
    {
        format = (await sharp(buffer, { limitInputPixels: MAX_PIXELS }).metadata()).format;
    }
    catch (error)
    {
        throw new ImageError("That file is not a readable image.");
    }

    if (!ALLOWED_FORMATS.has(format))
    {
        throw new ImageError("Only JPEG, PNG, WebP or GIF images are allowed.");
    }

    const base = `${slugify(label).slice(0, 60) || "image"}-${crypto.randomBytes(6).toString("hex")}`;
    const mainName = `${base}.webp`;
    const thumbName = `${base}-thumb.webp`;

    try
    {
        const pipeline = () => sharp(buffer, { limitInputPixels: MAX_PIXELS, failOn: "error" }).rotate();

        const main = await pipeline()
            .resize({ width: MAIN_SIZE, height: MAIN_SIZE, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();

        const thumb = await pipeline()
            .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();

        await fs.writeFile(path.join(UPLOAD_DIR, mainName), main, { flag: "wx" });
        await fs.writeFile(path.join(UPLOAD_DIR, thumbName), thumb, { flag: "wx" });
    }
    catch (error)
    {
        await removeFiles([mainName, thumbName]);

        throw new ImageError("That image could not be processed.");
    }

    return {
        name: mainName,
        url: `${UPLOAD_URL}/${mainName}`,
        thumbnail: `${UPLOAD_URL}/${thumbName}`
    };
}

async function removeFiles(names)
{
    await Promise.all(names.map((name) =>
    {
        if (!STORED_NAME.test(name))
        {
            return null;
        }

        return fs.unlink(path.join(UPLOAD_DIR, name)).catch((error) =>
        {
            if (error.code !== "ENOENT")
            {
                throw error;
            }
        });
    }));
}

// Newest first. Only the main images are listed; each has a "-thumb" companion.
async function listUploads()
{
    const names = (await fs.readdir(UPLOAD_DIR)).filter((name) => STORED_NAME.test(name) && !name.endsWith("-thumb.webp"));

    const items = await Promise.all(names.map(async (name) =>
    {
        const stat = await fs.stat(path.join(UPLOAD_DIR, name));

        return {
            name,
            url: `${UPLOAD_URL}/${name}`,
            thumbnail: `${UPLOAD_URL}/${name.replace(/\.webp$/, "-thumb.webp")}`,
            size: stat.size,
            uploadedAt: stat.mtime
        };
    }));

    return items.sort((a, b) => b.uploadedAt - a.uploadedAt);
}

async function deleteUpload(name)
{
    if (!STORED_NAME.test(name) || name.endsWith("-thumb.webp"))
    {
        return false;
    }

    await removeFiles([name, name.replace(/\.webp$/, "-thumb.webp")]);

    return true;
}

module.exports = { ImageError, processImage, removeFiles, listUploads, deleteUpload, STORED_NAME };
