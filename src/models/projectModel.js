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
        demo: "",
        technologies: ["C++", "CMake", "SDL3", "OpenGL", "GLM"]
    },
    {
        id: 2,
        title: "Hallownest Project",
        description: "A gameplay-focused prototype inspired by dark fantasy exploration.",
        category: "Game",
        type: "game",
        image: "",
        github: "",
        demo: "",
        technologies: ["Unity", "C#", "Blender"]
    },
    {
        id: 3,
        title: "Portfolio Website",
        description: "A personal website built with Express, EJS, JavaScript, CSS, and MySQL.",
        category: "App",
        type: "app",
        image: "",
        github: "",
        demo: "",
        technologies: ["Node.js", "Express", "EJS", "JavaScript", "CSS", "MySQL"]
    },
    {
        id: 4,
        title: "Tenant Bureau Platform",
        description: "A subscription-based platform for tenant and landlord services.",
        category: "App",
        type: "app",
        image: "",
        github: "",
        demo: "",
        technologies: ["Node.js", "Express", "EJS", "JavaScript", "CSS", "MySQL"]
    }
];

const projectSelect = `
    SELECT
        P.ID AS id,
        P.TITLE AS title,
        P.SLUG AS slug,
        P.SHORT_DESCRIPTION AS shortDescription,
        P.DESCRIPTION AS description,
        P.CATEGORY AS category,
        P.TYPE AS type,
        P.ROLE AS role,
        P.STATUS AS status,
        P.START_DATE AS startDate,
        P.END_DATE AS endDate,
        P.GITHUB_URL AS github,
        P.DEMO_URL AS demo,
        P.WEBSITE_URL AS website,
        P.IMAGE_URL AS image,
        TECH.technologies AS technologies
    FROM PROJECTS P
    LEFT JOIN (
        SELECT
            PROJECT_ID,
            GROUP_CONCAT(TECH_NAME ORDER BY DISPLAY_ORDER ASC SEPARATOR '||') AS technologies
        FROM PROJECT_TECH
        GROUP BY PROJECT_ID
    ) TECH
        ON TECH.PROJECT_ID = P.ID
`;

const normalizeProject = (project) =>
{
    if (!project)
    {
        return null;
    }

    const technologies = Array.isArray(project.technologies)
        ? project.technologies
        : String(project.technologies || "")
            .split("||")
            .map((tech) => tech.trim())
            .filter(Boolean);

    return {
        ...project,
        technologies
    };
};

const normalizeProjects = (projects) => projects.map(normalizeProject);

exports.findAll = async () =>
{
    if (useMockData)
    {
        return normalizeProjects(mockProjects);
    }

    const [rows] = await db.query(`
        ${projectSelect}
        ORDER BY P.DISPLAY_ORDER ASC, P.START_DATE DESC, P.ID DESC
    `);

    return normalizeProjects(rows);
};

exports.findByType = async (type) =>
{
    if (useMockData)
    {
        return normalizeProjects(
            mockProjects.filter((project) => project.type === type)
        );
    }

    const [rows] = await db.query(
        `
        ${projectSelect}
        WHERE LOWER(P.TYPE) = LOWER(?)
        ORDER BY P.DISPLAY_ORDER ASC, P.START_DATE DESC, P.ID DESC
        `,
        [type]
    );

    return normalizeProjects(rows);
};

exports.findById = async (id) =>
{
    if (useMockData)
    {
        return normalizeProject(
            mockProjects.find((project) => String(project.id) === String(id)) || null
        );
    }

    const [rows] = await db.query(
        `
        ${projectSelect}
        WHERE P.ID = ?
        `,
        [id]
    );

    return normalizeProject(rows[0] || null);
};