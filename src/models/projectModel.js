const db = require("../config/db");

const useMockData =
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_DEV_DB !== "true";

const mockProjects = [
    {
        id: 1,
        slug: "joseph-driedger-personal-website",
        title: "Joseph Driedger Personal Website",
        shortDescription: "Personal portfolio website built with Node.js, Express, EJS, and MySQL.",
        description: "A personal portfolio website for showcasing projects, technical skills, and professional experience. Built with a Node.js and Express backend, EJS templating, and a MySQL database. Features a responsive design with project filtering by category and technology, a contact form with reCAPTCHA protection, and dynamic project detail pages.",
        category: "Personal",
        type: "website",
        role: "Developer",
        status: "in-progress",
        image: "/images/projects/personal-website.png",
        github: "https://github.com/JosephDriedger/Personal-Website",
        demo: null,
        website: "https://joeydriedger.ca",
        technologies: ["Node.js", "Express.js", "EJS", "HTML5", "CSS", "JavaScript", "MySQL"]
    },
    {
        id: 2,
        slug: "flank-capture-the-flag",
        title: "Flank: Capture the Flag",
        shortDescription: "Desktop multiplayer Unity 2D strategy game adapted from a tabletop design.",
        description: "A desktop multiplayer strategy game adapted from a tabletop design created in the Fall 2025 Game Design class. Players compete in a turn-based capture-the-flag format, managing units and tactics on a grid-based battlefield. Built in Unity with C# gameplay logic and custom UI designed for strategic play.",
        category: "Personal",
        type: "game",
        role: "Developer",
        status: "completed",
        image: "/images/projects/flank.png",
        github: "https://github.com/JosephDriedger/flank-game",
        demo: null,
        website: null,
        technologies: ["Unity", "C#", "Visual Studio"]
    },
    {
        id: 3,
        slug: "echoes-of-the-forgotten-keep",
        title: "Echoes of the Forgotten Keep",
        shortDescription: "3D dungeon-adventure game built on a custom C++ game engine.",
        description: "A 3D dungeon-adventure game built on a fully custom C++ game engine. Players explore a dungeon environment rendered with OpenGL, navigating hazards and interacting with the world through systems built from scratch. The engine features an entity-component system (ECS), scene graph, collision detection, and physics, with 3D assets loaded via Assimp.",
        category: "Academic",
        type: "game",
        role: "Engine Architecture Engineer",
        status: "completed",
        image: "/images/projects/echoes.png",
        github: "https://github.com/JosephDriedger/echoes-of-the-forgotten-keep",
        demo: "https://github.com/JosephDriedger/echoes-of-the-forgotten-keep/releases/tag/v1.0.0",
        website: null,
        technologies: ["C++", "OpenGL", "GLFW", "GLM", "Assimp", "CMake"]
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

exports.findBySlug = async (slug) =>
{
    if (useMockData)
    {
        return normalizeProject(
            mockProjects.find((project) => project.slug === slug) || null
        );
    }

    const [rows] = await db.query(
        `
        ${projectSelect}
        WHERE P.SLUG = ?
        `,
        [slug]
    );

    return normalizeProject(rows[0] || null);
};