const projectService = require("../services/projectService");

exports.getProjects = async (req, res, next) => {
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

exports.getGames = async (req, res, next) => {
  try {
    const projects = await projectService.getProjectsByType("game");

    res.render("pages/games", {
      title: "Games",
      projects,
    });
  } catch (error) {
    next(error);
  }
};

exports.getApps = async (req, res, next) => {
  try {
    const projects = await projectService.getProjectsByType("app");

    res.render("pages/apps", {
      title: "Apps",
      projects,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectDetail = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);

    res.render("pages/project-detail", {
      title: project.title,
      project,
    });
  } catch (error) {
    next(error);
  }
};
