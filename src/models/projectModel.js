const db = require("../config/db");

const useMockData =
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_DEV_DB !== "true";

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
    if (useMockData)
    {
        return mockProjects;
    }

    const [rows] = await db.query(`
        SELECT
            ID AS id,
            TITLE AS title,
            SLUG AS slug,
            SHORT_DESCRIPTION AS shortDescription,
            DESCRIPTION AS description,
            CATEGORY AS category,
            TYPE AS type,
            ROLE AS role,
            STATUS AS status,
            START_DATE AS startDate,
            END_DATE AS endDate,
            GITHUB_URL AS github,
            DEMO_URL AS demo,
            WEBSITE_URL AS website,
            IMAGE_URL AS image
        FROM PROJECTS
        ORDER BY DISPLAY_ORDER ASC, START_DATE DESC, ID DESC
    `);

    return rows;
};

exports.findByType = async (type) =>
{
    if (useMockData)
    {
        return mockProjects.filter((project) => project.type === type);
    }

    const [rows] = await db.query(
        `
        SELECT
            ID AS id,
            TITLE AS title,
            SLUG AS slug,
            SHORT_DESCRIPTION AS shortDescription,
            DESCRIPTION AS description,
            CATEGORY AS category,
            TYPE AS type,
            ROLE AS role,
            STATUS AS status,
            START_DATE AS startDate,
            END_DATE AS endDate,
            GITHUB_URL AS github,
            DEMO_URL AS demo,
            WEBSITE_URL AS website,
            IMAGE_URL AS image
        FROM PROJECTS
        WHERE TYPE = ?
        ORDER BY DISPLAY_ORDER ASC, START_DATE DESC, ID DESC
        `,
        [type]
    );

    return rows;
};

exports.findById = async (id) =>
{
    if (useMockData)
    {
        return mockProjects.find((project) => String(project.id) === String(id)) || null;
    }

    const [rows] = await db.query(
        `
        SELECT
            ID AS id,
            TITLE AS title,
            SLUG AS slug,
            SHORT_DESCRIPTION AS shortDescription,
            DESCRIPTION AS description,
            CATEGORY AS category,
            TYPE AS type,
            ROLE AS role,
            STATUS AS status,
            START_DATE AS startDate,
            END_DATE AS endDate,
            GITHUB_URL AS github,
            DEMO_URL AS demo,
            WEBSITE_URL AS website,
            IMAGE_URL AS image
        FROM PROJECTS
        WHERE ID = ?
        `,
        [id]
    );

    return rows[0] || null;
};