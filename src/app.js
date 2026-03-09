const express = require("express");
const path = require("path");

const indexRoutes = require("./routes/index");
const projectRoutes = require("./routes/projects");
const videoRoutes = require("./routes/videos");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/*
View Engine
*/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/*
Middleware
*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

/*
Errors
*/
app.use(notFound);
app.use(errorHandler);

module.exports = app;
