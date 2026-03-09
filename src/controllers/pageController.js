const projectService = require("../services/projectService");
const videoService = require("../services/videoService");

exports.home = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();

    res.render("pages/home", {
      title: "Home",
      projects: projects.slice(0, 3),
    });
  } catch (error) {
    next(error);
  }
};

exports.projects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();

    res.render("pages/projects", {
      title: "Projects",
      projects,
    });
  } catch (error) {
    next(error);
  }
};

exports.musicVideos = async (req, res, next) => {
  try {
    const videos = await videoService.getAllVideos();

    res.render("pages/music-videos", {
      title: "Music Videos",
      videos,
    });
  } catch (error) {
    next(error);
  }
};

exports.about = (req, res) => {
  res.render("pages/about", {
    title: "About",
  });
};

exports.contact = (req, res) => {
  res.render("pages/contact", {
    title: "Contact",
  });
};
