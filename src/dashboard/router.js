const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");

const auth = require("./auth");
const model = require("./model");
const validation = require("./validation");

const router = express.Router();

const MESSAGES = {
    "project-created": "Project created.",
    "project-saved": "Project saved.",
    "project-deleted": "Project deleted.",
    "video-created": "Video added.",
    "video-saved": "Video saved.",
    "video-deleted": "Video deleted."
};

const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const clientIp = (req) => req.ip || "unknown";

const audit = (req, action) => console.log(`[dashboard] ${new Date().toISOString()} ${clientIp(req)} ${action}`);

const parseId = (value) => (/^\d{1,10}$/.test(String(value)) ? Number(value) : null);

const flash = (req) => MESSAGES[req.query.msg] || null;

function render(req, res, view, data = {})
{
    res.render(`dashboard/${view}`, {
        title: "Dashboard",
        csrfToken: res.locals.csrfToken || "",
        loggedIn: Boolean(req.dashboardSession),
        flash: flash(req),
        errors: {},
        ...data
    });
}

function projectFormValues(project)
{
    return {
        ...project,
        technologiesText: (project.technologies || []).join("\n"),
        mediaText: (project.media || [])
            .map((item) => [item.title, item.url, item.thumbnail].filter(Boolean).join(" | "))
            .join("\n")
    };
}

const blankProject = projectFormValues({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    category: "Personal",
    type: "App",
    role: "",
    status: "Completed",
    startDate: "",
    endDate: "",
    github: "",
    demo: "",
    website: "",
    image: "",
    thumbnail: "",
    isFeatured: false,
    displayOrder: 0,
    technologies: [],
    media: []
});

const formOptions = {
    categories: validation.CATEGORIES,
    types: validation.TYPES,
    statuses: validation.STATUSES
};

/*
Gate: the dashboard answers 404 until a password hash is configured.
*/
router.use((req, res, next) => (auth.isEnabled() ? next() : res.status(404).send("Not found")));

router.use(auth.securityHeaders);
router.use("/static", express.static(path.join(__dirname, "static"), { maxAge: 0 }));
router.use(auth.loadSession);

/*
Login / logout
*/
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) =>
    {
        audit(req, "login rate-limited");
        res.status(429).render("dashboard/login", {
            title: "Sign in",
            loggedIn: false,
            csrfToken: "",
            flash: null,
            error: "Too many failed attempts. Try again in a few minutes."
        });
    }
});

router.get("/login", (req, res) =>
{
    if (req.dashboardSession)
    {
        return res.redirect("/");
    }

    render(req, res, "login", { title: "Sign in", error: null });
});

router.post("/login", loginLimiter, wrap(async (req, res) =>
{
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const origin = req.get("Origin");

    if (origin && origin !== `${req.protocol}://${req.get("host")}`)
    {
        return res.status(403).send("Forbidden");
    }

    if (password.length > 0 && password.length <= 1024 && auth.verifyPassword(password, process.env.DASHBOARD_PASSWORD_HASH))
    {
        // Drop any session id the browser arrived with, then issue a fresh one.
        auth.destroySession(req, res);
        auth.createSession(res);
        audit(req, "login ok");

        return res.redirect("/");
    }

    audit(req, "login failed");
    await new Promise((resolve) => setTimeout(resolve, 600));

    res.status(401);
    render(req, res, "login", { title: "Sign in", error: "Incorrect password." });
}));

router.post("/logout", auth.requireLogin, auth.requireCsrf, (req, res) =>
{
    audit(req, "logout");
    auth.destroySession(req, res);
    res.redirect("/login");
});

/*
Everything below needs a signed-in session and a valid CSRF token on writes.
*/
router.use(auth.requireLogin);
router.use(auth.requireCsrf);

router.get("/", wrap(async (req, res) =>
{
    const [projects, videos] = await Promise.all([model.listProjects(), model.listVideos()]);

    render(req, res, "index", { title: "Overview", projectCount: projects.length, videoCount: videos.length });
}));

/*
Projects
*/
router.get("/projects", wrap(async (req, res) =>
{
    render(req, res, "projects", { title: "Projects", projects: await model.listProjects() });
}));

router.get("/projects/new", (req, res) =>
{
    render(req, res, "project-form", {
        title: "New project",
        project: blankProject,
        action: "/projects",
        isNew: true,
        ...formOptions
    });
});

async function saveProject(req, res, id)
{
    const { errors, values } = validation.validateProject(req.body);
    const isNew = id === null;

    const rerender = (status, extraErrors = {}) =>
    {
        res.status(status);
        render(req, res, "project-form", {
            title: isNew ? "New project" : "Edit project",
            project: projectFormValues({ ...values, id }),
            action: isNew ? "/projects" : `/projects/${id}`,
            isNew,
            errors: { ...errors, ...extraErrors },
            ...formOptions
        });
    };

    if (Object.keys(errors).length > 0)
    {
        return rerender(400);
    }

    try
    {
        if (isNew)
        {
            const newId = await model.createProject(values);
            audit(req, `project created id=${newId} slug=${values.slug}`);

            return res.redirect("/projects?msg=project-created");
        }

        const updated = await model.updateProject(id, values);

        if (!updated)
        {
            return res.status(404).send("Not found");
        }

        audit(req, `project updated id=${id}`);

        return res.redirect("/projects?msg=project-saved");
    }
    catch (error)
    {
        if (model.isDuplicate(error))
        {
            return rerender(409, { slug: "Another project already uses this slug." });
        }

        throw error;
    }
}

router.post("/projects", wrap((req, res) => saveProject(req, res, null)));

router.get("/projects/:id/edit", wrap(async (req, res) =>
{
    const id = parseId(req.params.id);
    const project = id === null ? null : await model.getProject(id);

    if (!project)
    {
        return res.status(404).send("Not found");
    }

    render(req, res, "project-form", {
        title: "Edit project",
        project: projectFormValues(project),
        action: `/projects/${id}`,
        isNew: false,
        ...formOptions
    });
}));

router.post("/projects/:id", wrap((req, res) =>
{
    const id = parseId(req.params.id);

    return id === null ? res.status(404).send("Not found") : saveProject(req, res, id);
}));

router.post("/projects/:id/delete", wrap(async (req, res) =>
{
    const id = parseId(req.params.id);

    if (id === null || !(await model.deleteProject(id)))
    {
        return res.status(404).send("Not found");
    }

    audit(req, `project deleted id=${id}`);
    res.redirect("/projects?msg=project-deleted");
}));

/*
Music videos
*/
async function renderVideos(req, res, status = 200, extra = {})
{
    res.status(status);
    render(req, res, "videos", {
        title: "Music videos",
        videos: await model.listVideos(),
        newVideo: { title: "", url: "" },
        editingId: null,
        ...extra
    });
}

router.get("/videos", wrap((req, res) => renderVideos(req, res)));

router.post("/videos", wrap(async (req, res) =>
{
    const { errors, values } = validation.validateVideo(req.body);

    if (Object.keys(errors).length > 0)
    {
        return renderVideos(req, res, 400, { errors, newVideo: values });
    }

    try
    {
        const id = await model.createVideo(values);
        audit(req, `video created id=${id} youtube=${values.videoId}`);

        return res.redirect("/videos?msg=video-created");
    }
    catch (error)
    {
        if (model.isDuplicate(error))
        {
            return renderVideos(req, res, 409, {
                errors: { url: "That video is already on the site." },
                newVideo: values
            });
        }

        throw error;
    }
}));

router.post("/videos/:id", wrap(async (req, res) =>
{
    const id = parseId(req.params.id);

    if (id === null)
    {
        return res.status(404).send("Not found");
    }

    const { errors, values } = validation.validateVideo(req.body);

    if (Object.keys(errors).length > 0)
    {
        return renderVideos(req, res, 400, { errors, editingId: id, editValues: values });
    }

    try
    {
        if (!(await model.updateVideo(id, values)))
        {
            return res.status(404).send("Not found");
        }

        audit(req, `video updated id=${id}`);

        return res.redirect("/videos?msg=video-saved");
    }
    catch (error)
    {
        if (model.isDuplicate(error))
        {
            return renderVideos(req, res, 409, {
                errors: { url: "That video is already on the site." },
                editingId: id,
                editValues: values
            });
        }

        throw error;
    }
}));

router.post("/videos/:id/delete", wrap(async (req, res) =>
{
    const id = parseId(req.params.id);

    if (id === null || !(await model.deleteVideo(id)))
    {
        return res.status(404).send("Not found");
    }

    audit(req, `video deleted id=${id}`);
    res.redirect("/videos?msg=video-deleted");
}));

// Anything else on the dashboard host.
router.use((req, res) => res.status(404).send("Not found"));

router.use((err, req, res, next) =>
{
    console.error("[dashboard] error:", err);
    res.status(500).send("Server error");
});

module.exports = router;
