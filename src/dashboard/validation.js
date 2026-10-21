const { extractYouTubeId } = require("../utils/youtube");

const CATEGORIES = ["Personal", "Academic", "Industry"];
const TYPES = ["Game", "App", "Website", "AI", "Other"];
const STATUSES = ["Planned", "In-Progress", "Completed"];

const MAX_TECHNOLOGIES = 30;
const MAX_MEDIA = 40;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_PATH_PATTERN = /^\/images\/[A-Za-z0-9._~%+\/-]+$/;

// Form values must be plain strings; arrays/objects (from crafted bodies) are rejected.
function text(value)
{
    return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : null;
}

function slugify(value)
{
    return String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 255);
}

function isValidDate(value)
{
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isHttpUrl(value)
{
    try
    {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
    }
    catch (error)
    {
        return false;
    }
}

function isImageLocation(value)
{
    if (value.includes("..") || value.includes("//", value.startsWith("http") ? 8 : 0))
    {
        return false;
    }

    return IMAGE_PATH_PATTERN.test(value) || (value.startsWith("https://") && isHttpUrl(value));
}

function validateVideo(body)
{
    const errors = {};
    const title = text(body.title);
    const source = text(body.url);
    const videoId = extractYouTubeId(source);

    if (!title)
    {
        errors.title = "Title is required.";
    }
    else if (title.length > 255)
    {
        errors.title = "Title must be 255 characters or fewer.";
    }

    if (!source)
    {
        errors.url = "A YouTube link or video ID is required.";
    }
    else if (!videoId)
    {
        errors.url = "Enter a YouTube link (youtu.be, youtube.com/watch, /embed or /shorts) or an 11-character video ID.";
    }

    return { errors, values: { title: title || "", videoId, url: source || "" } };
}

function parseTechnologies(raw, errors)
{
    const seen = new Set();
    const technologies = [];

    String(raw || "").split(/[\n,]/).forEach((entry) =>
    {
        const name = entry.trim();

        if (name && !seen.has(name.toLowerCase()))
        {
            seen.add(name.toLowerCase());
            technologies.push(name);
        }
    });

    if (technologies.length > MAX_TECHNOLOGIES)
    {
        errors.technologies = `Use at most ${MAX_TECHNOLOGIES} technologies.`;
    }
    else if (technologies.some((name) => name.length > 100))
    {
        errors.technologies = "Each technology must be 100 characters or fewer.";
    }

    return technologies;
}

// One screenshot per line: "Title | /images/projects/x/01.webp | /images/projects/x/01-thumb.webp"
function parseMedia(raw, errors)
{
    const media = [];
    const lines = String(raw || "").split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.length > MAX_MEDIA)
    {
        errors.media = `Use at most ${MAX_MEDIA} screenshots.`;
        return media;
    }

    for (let index = 0; index < lines.length; index += 1)
    {
        const parts = lines[index].split("|").map((part) => part.trim());
        const [title, url, thumbnail] = parts;

        if (parts.length < 2 || parts.length > 3 || !title || !url)
        {
            errors.media = `Screenshot line ${index + 1}: use "Title | image path | thumbnail path".`;
            break;
        }

        if (title.length > 255)
        {
            errors.media = `Screenshot line ${index + 1}: title must be 255 characters or fewer.`;
            break;
        }

        if (!isImageLocation(url) || (thumbnail && !isImageLocation(thumbnail)))
        {
            errors.media = `Screenshot line ${index + 1}: image paths must start with /images/ (or be https:// links) and contain no "..".`;
            break;
        }

        media.push({ title, url, thumbnail: thumbnail || null });
    }

    return media;
}

function validateProject(body)
{
    const errors = {};

    const title = text(body.title);
    let slug = text(body.slug);
    const shortDescription = text(body.shortDescription);
    const description = text(body.description);
    const role = text(body.role);
    const category = text(body.category);
    const type = text(body.type);
    const status = text(body.status);
    const startDate = text(body.startDate);
    const endDate = text(body.endDate);
    const github = text(body.github);
    const demo = text(body.demo);
    const website = text(body.website);
    const image = text(body.image);
    const thumbnail = text(body.thumbnail);
    const displayOrderRaw = text(body.displayOrder);

    if (!title)
    {
        errors.title = "Title is required.";
    }
    else if (title.length > 255)
    {
        errors.title = "Title must be 255 characters or fewer.";
    }

    slug = slug || slugify(title);

    if (!slug)
    {
        errors.slug = "Slug is required.";
    }
    else if (slug.length > 255 || !SLUG_PATTERN.test(slug))
    {
        errors.slug = "Slug may only contain lowercase letters, numbers and single hyphens.";
    }

    if (shortDescription && shortDescription.length > 255)
    {
        errors.shortDescription = "Short description must be 255 characters or fewer.";
    }

    if (description && description.length > 10000)
    {
        errors.description = "Description must be 10,000 characters or fewer.";
    }

    if (role && role.length > 255)
    {
        errors.role = "Role must be 255 characters or fewer.";
    }

    if (!CATEGORIES.includes(category))
    {
        errors.category = "Choose a category.";
    }

    if (!TYPES.includes(type))
    {
        errors.type = "Choose a type.";
    }

    if (!STATUSES.includes(status))
    {
        errors.status = "Choose a status.";
    }

    if (startDate && !isValidDate(startDate))
    {
        errors.startDate = "Use a valid date (YYYY-MM-DD).";
    }

    if (endDate && !isValidDate(endDate))
    {
        errors.endDate = "Use a valid date (YYYY-MM-DD).";
    }

    if (!errors.startDate && !errors.endDate && startDate && endDate && endDate < startDate)
    {
        errors.endDate = "End date cannot be before the start date.";
    }

    [["github", github], ["demo", demo], ["website", website]].forEach(([field, value]) =>
    {
        if (value && (value.length > 255 || !isHttpUrl(value)))
        {
            errors[field] = "Enter a full http:// or https:// link (255 characters max).";
        }
    });

    [["image", image], ["thumbnail", thumbnail]].forEach(([field, value]) =>
    {
        if (value && (value.length > 255 || !isImageLocation(value)))
        {
            errors[field] = 'Use a path starting with /images/ (or an https:// link) with no "..".';
        }
    });

    let displayOrder = 0;

    if (displayOrderRaw)
    {
        displayOrder = Number(displayOrderRaw);

        if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 9999)
        {
            errors.displayOrder = "Use a whole number between 0 and 9999.";
        }
    }

    const technologies = parseTechnologies(body.technologies, errors);
    const media = parseMedia(typeof body.media === "string" ? body.media : "", errors);

    if (typeof body.technologies !== "string" && body.technologies !== undefined)
    {
        errors.technologies = "Invalid technologies.";
    }

    return {
        errors,
        values: {
            title: title || "",
            slug,
            shortDescription: shortDescription || "",
            description: description || "",
            role: role || "",
            category,
            type,
            status,
            startDate: startDate || "",
            endDate: endDate || "",
            github: github || "",
            demo: demo || "",
            website: website || "",
            image: image || "",
            thumbnail: thumbnail || "",
            isFeatured: body.isFeatured === "on",
            displayOrder,
            technologies,
            media
        }
    };
}

module.exports = {
    MAX_MEDIA,
    CATEGORIES,
    TYPES,
    STATUSES,
    slugify,
    isValidDate,
    isHttpUrl,
    isImageLocation,
    validateVideo,
    validateProject
};
