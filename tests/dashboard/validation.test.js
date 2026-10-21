const test = require("node:test");
const assert = require("node:assert");

const { validateProject, validateVideo, slugify, isImageLocation } = require("../../src/dashboard/validation");

const validProject = () => ({
    title: "My Project",
    slug: "",
    shortDescription: "Short",
    description: "Long",
    category: "Personal",
    type: "Game",
    role: "Dev",
    status: "In-Progress",
    startDate: "2026-01-31",
    endDate: "",
    github: "https://github.com/x/y",
    demo: "",
    website: "",
    image: "/images/projects/x/01.webp",
    thumbnail: "",
    displayOrder: "3",
    isFeatured: "on",
    technologies: "C#, Unity\nC#\n  Blender ",
    media: "First | /images/projects/x/01.webp | /images/projects/x/01-thumb.webp\nSecond | /images/projects/x/02.webp"
});

test("a valid project passes and is normalised", () =>
{
    const { errors, values } = validateProject(validProject());

    assert.deepStrictEqual(errors, {});
    assert.strictEqual(values.slug, "my-project");
    assert.strictEqual(values.isFeatured, true);
    assert.strictEqual(values.displayOrder, 3);
    assert.deepStrictEqual(values.technologies, ["C#", "Unity", "Blender"]);
    assert.strictEqual(values.media.length, 2);
    assert.strictEqual(values.media[1].thumbnail, null);
});

test("javascript: and data: links are rejected for link fields", () =>
{
    for (const bad of ["javascript:alert(1)", "data:text/html,hi", "ftp://x.com/a", "//evil.com"])
    {
        const body = { ...validProject(), github: bad, website: bad, demo: bad };
        const { errors } = validateProject(body);

        assert.ok(errors.github && errors.website && errors.demo, `${bad} should be rejected`);
    }
});

test("image paths must be under /images/ with no traversal", () =>
{
    assert.ok(isImageLocation("/images/projects/a/b.webp"));
    assert.ok(isImageLocation("https://cdn.example.com/a.png"));

    for (const bad of ["/etc/passwd", "/images/../secret", "/images//x", "javascript:x", "http://insecure.com/a.png", "/images/a b.png", "/images/<x>.png"])
    {
        assert.strictEqual(isImageLocation(bad), false, bad);
    }
});

test("enums, dates and ranges are enforced", () =>
{
    const { errors } = validateProject({
        ...validProject(),
        category: "Hacker",
        type: "Nope",
        status: "Done",
        startDate: "2026-02-30",
        displayOrder: "-1"
    });

    assert.ok(errors.category && errors.type && errors.status && errors.startDate && errors.displayOrder);
});

test("end date cannot precede start date", () =>
{
    const { errors } = validateProject({ ...validProject(), startDate: "2026-05-01", endDate: "2026-04-01" });

    assert.ok(errors.endDate);
});

test("non-string values (crafted bodies) are rejected, not coerced", () =>
{
    const { errors } = validateProject({ ...validProject(), title: ["a"], category: { x: 1 } });

    assert.ok(errors.title && errors.category);
});

test("malformed screenshot lines are reported", () =>
{
    const { errors } = validateProject({ ...validProject(), media: "only a title" });

    assert.ok(errors.media);
});

test("slugify strips accents and symbols", () =>
{
    assert.strictEqual(slugify("  Lock-in' Ringers Website!! "), "lock-in-ringers-website");
    assert.strictEqual(slugify("Café Déjà Vu"), "cafe-deja-vu");
});

test("videos accept links and bare IDs, and reject everything else", () =>
{
    assert.strictEqual(validateVideo({ title: "T", url: "https://youtu.be/QGVs-uYeUHo?si=abc" }).values.videoId, "QGVs-uYeUHo");
    assert.strictEqual(validateVideo({ title: "T", url: "3QpVrjFePGk" }).values.videoId, "3QpVrjFePGk");
    assert.ok(validateVideo({ title: "T", url: "https://example.com/watch" }).errors.url);
    assert.ok(validateVideo({ title: "", url: "3QpVrjFePGk" }).errors.title);
    assert.ok(validateVideo({ title: "x".repeat(256), url: "3QpVrjFePGk" }).errors.title);
});
