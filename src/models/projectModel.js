const db = require("../config/db");

const devMode = process.env.DEV_MODE === "true";

const mockProjects = [
    {
        id: 1,
        title: "Echoes of the Forgotten Keep",
        description: "A custom C++ dungeon game project built with a custom engine.",
        category: "Game",
        type: "game",
        image: "",
        github: "https://github.com/JosephDriedger/echoes-of-the-forgotten-keep",
        demo: ""
    },
    {
        id: 2,
        title: "Hallownest Project",
        description: "A gameplay-focused prototype inspired by dark fantasy exploration.",
        category: "Game",
        type: "game",
        image: "",
        github: "",
        demo: ""
    },
    {
        id: 3,
        title: "Portfolio Website",
        description: "A personal website built with Express, EJS, JavaScript, CSS, and MySQL.",
        category: "App",
        type: "app",
        image: "",
        github: "",
        demo: ""
    },
    {
        id: 4,
        title: "Tenant Bureau Platform",
        description: "A subscription-based platform for tenant and landlord services.",
        category: "App",
        type: "app",
        image: "",
        github: "",
        demo: ""
    }
];

exports.findAll = async () =>
{
    if (devMode)
    {
        return mockProjects;
    }

    const [rows] = await db.query("SELECT * FROM projects");
    return rows;
};

exports.findByType = async (type) =>
{
    if (devMode)
    {
        return mockProjects.filter((project) => project.type === type);
    }

    const [rows] = await db.query(
        "SELECT * FROM projects WHERE type = ?",
        [type]
    );

    return rows;
};

exports.findById = async (id) =>
{
    if (devMode)
    {
        return mockProjects.find((project) => String(project.id) === String(id)) || null;
    }

    const [rows] = await db.query(
        "SELECT * FROM projects WHERE id = ?",
        [id]
    );

    return rows[0] || null;
};