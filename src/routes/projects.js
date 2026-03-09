const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController");

router.get("/", projectController.getProjects);
router.get("/games", projectController.getGames);
router.get("/apps", projectController.getApps);
router.get("/:id", projectController.getProjectDetail);

module.exports = router;
