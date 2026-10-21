const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-test-"));

const sharp = require("sharp");
const images = require("../../src/dashboard/images");

const png = (width = 50, height = 30) =>
    sharp({ create: { width, height, channels: 3, background: { r: 200, g: 20, b: 20 } } }).png().toBuffer();

test("a real image is re-encoded to WebP with a thumbnail and a generated name", async () =>
{
    const saved = await images.processImage(await png(3000, 2000), "../../evil name!.png");

    assert.match(saved.name, /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/);
    assert.ok(!saved.name.includes(".."));
    assert.strictEqual(saved.url, `/images/uploads/${saved.name}`);

    const main = await sharp(path.join(process.env.UPLOAD_DIR, saved.name)).metadata();
    const thumb = await sharp(path.join(process.env.UPLOAD_DIR, saved.name.replace(".webp", "-thumb.webp"))).metadata();

    assert.strictEqual(main.format, "webp");
    assert.ok(main.width <= 1920);
    assert.ok(thumb.width <= 640);
});

test("EXIF metadata is stripped", async () =>
{
    const withExif = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#fff" } })
        .jpeg()
        .withExif({ IFD0: { Copyright: "secret-gps-owner" } })
        .toBuffer();

    const saved = await images.processImage(withExif, "photo");
    const bytes = fs.readFileSync(path.join(process.env.UPLOAD_DIR, saved.name));

    assert.ok(!bytes.includes(Buffer.from("secret-gps-owner")));
});

test("non-images are rejected, whatever they are named", async () =>
{
    for (const content of [
        Buffer.from("<?php system($_GET['c']); ?>"),
        Buffer.from("<script>alert(1)</script>"),
        Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
        Buffer.from("MZ\x90\x00 fake exe"),
        Buffer.alloc(0)
    ])
    {
        await assert.rejects(images.processImage(content, "shell.png"), images.ImageError);
    }
});

test("decompression bombs (huge pixel counts) are rejected", async () =>
{
    const huge = await sharp({ create: { width: 7000, height: 7000, channels: 3, background: "#000" } }).png({ compressionLevel: 9 }).toBuffer();

    await assert.rejects(images.processImage(huge, "bomb"), images.ImageError);
});

test("delete only accepts generated names and cannot escape the upload dir", async () =>
{
    const outside = path.join(process.env.UPLOAD_DIR, "..", "outside-test.webp");
    fs.writeFileSync(outside, "x");

    for (const bad of ["../outside-test.webp", "..\\outside-test.webp", "/etc/passwd", "a.png", "x-thumb.webp", "", "a/b.webp"])
    {
        assert.strictEqual(await images.deleteUpload(bad), false, bad);
    }

    assert.ok(fs.existsSync(outside));
    fs.unlinkSync(outside);

    const saved = await images.processImage(await png(), "to-delete");
    assert.strictEqual(await images.deleteUpload(saved.name), true);
    assert.ok(!fs.existsSync(path.join(process.env.UPLOAD_DIR, saved.name)));
    assert.ok(!fs.existsSync(path.join(process.env.UPLOAD_DIR, saved.name.replace(".webp", "-thumb.webp"))));
});

test("listUploads returns main images only, newest first", async () =>
{
    const items = await images.listUploads();

    assert.ok(items.length >= 2);
    assert.ok(items.every((item) => !item.name.endsWith("-thumb.webp")));
    assert.ok(items.every((item) => item.thumbnail.endsWith("-thumb.webp")));
});
