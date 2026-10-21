const express = require("express");
const path = require("path");

const indexRoutes = require("./routes/index");
const projectRoutes = require("./routes/projects");
const videoRoutes = require("./routes/videos");
const contactRoutes = require("./routes/contact");
const dashboardRouter = require("./dashboard/router");
const { UPLOAD_DIR, UPLOAD_URL } = require("./config/uploads");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// In production the app sits behind nginx, which sets X-Forwarded-For/-Proto.
// Trusting exactly one hop gives rate limiting the real client IP.
if (process.env.NODE_ENV === "production")
{
    app.set("trust proxy", 1);
}

const dashboardHost = (
    process.env.DASHBOARD_HOST ||
    (process.env.NODE_ENV === "production" ? "dashboard.joeydriedger.ca" : "dashboard.localhost")
).toLowerCase();

/*
View Engine
*/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Appended to CSS/JS URLs so browsers fetch fresh files after every deploy/restart.
app.locals.assetVersion = Date.now().toString(36);

/*
Middleware
*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/*
Dashboard
Served only for requests to the dashboard subdomain. Matches the raw Host header
(not X-Forwarded-Host, which a client could forge), and nothing from the public
site is reachable on that host.
*/
app.use((req, res, next) =>
{
    const host = String(req.headers.host || "").split(":")[0].toLowerCase();

    return host === dashboardHost ? dashboardRouter(req, res, next) : next();
});

/*
Dashboard uploads (kept outside public/ so deploys never touch them)
Random file names never change, so browsers may cache them for a long time.
*/
app.use(UPLOAD_URL, express.static(UPLOAD_DIR, {
    index: false,
    redirect: false,
    dotfiles: "ignore",
    maxAge: "30d",
    immutable: true,
    setHeaders: (res) => res.set("X-Content-Type-Options", "nosniff")
}));

/*
Static Files
*/
app.use(express.static(path.join(__dirname, "../public")));

/*
Routes
*/
app.use("/", indexRoutes);
app.use("/projects", projectRoutes);
app.use("/videos", videoRoutes);
app.use("/", contactRoutes);

/*
Errors
*/
app.use(notFound);
app.use(errorHandler);

module.exports = app;
