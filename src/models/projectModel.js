const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const publicDir = path.join(__dirname, "../../public");

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
        status: "completed",
        image: "/images/projects/personal-website/01-home.webp",
        thumbnail: "/images/projects/personal-website/01-home-thumb.webp",
        github: "https://github.com/JosephDriedger/Personal-Website",
        demo: null,
        website: "https://joeydriedger.ca",
        technologies: ["Node.js", "Express.js", "EJS", "HTML5", "CSS", "JavaScript", "MySQL"],
        media: [
            { type: "image", title: "Home Page with Featured Projects", url: "/images/projects/personal-website/01-home.webp", thumbnail: "/images/projects/personal-website/01-home-thumb.webp" },
            { type: "image", title: "Projects Page with Search and Technology Filters", url: "/images/projects/personal-website/02-projects.webp", thumbnail: "/images/projects/personal-website/02-projects-thumb.webp" },
            { type: "image", title: "Project Detail Page with Screenshot Gallery", url: "/images/projects/personal-website/03-project-detail.webp", thumbnail: "/images/projects/personal-website/03-project-detail-thumb.webp" },
            { type: "image", title: "Music Videos Page", url: "/images/projects/personal-website/04-music-videos.webp", thumbnail: "/images/projects/personal-website/04-music-videos-thumb.webp" },
            { type: "image", title: "Contact Form with reCAPTCHA", url: "/images/projects/personal-website/05-contact.webp", thumbnail: "/images/projects/personal-website/05-contact-thumb.webp" }
        ]
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
        image: "/images/projects/flank/01-gameplay-board.webp",
        thumbnail: "/images/projects/flank/01-gameplay-board-thumb.webp",
        github: "https://github.com/JosephDriedger/flank-game",
        demo: null,
        website: null,
        technologies: ["Unity", "C#", "Visual Studio"],
        media: [
            { type: "image", title: "Gameplay: Tactical Hex Board", url: "/images/projects/flank/01-gameplay-board.webp", thumbnail: "/images/projects/flank/01-gameplay-board-thumb.webp" },
            { type: "image", title: "Gameplay: Selected Pieces Highlight Every Legal Move", url: "/images/projects/flank/02-gameplay-selection.webp", thumbnail: "/images/projects/flank/02-gameplay-selection-thumb.webp" },
            { type: "image", title: "Main Menu", url: "/images/projects/flank/03-main-menu.webp", thumbnail: "/images/projects/flank/03-main-menu-thumb.webp" },
            { type: "image", title: "Game Modes", url: "/images/projects/flank/04-game-modes.webp", thumbnail: "/images/projects/flank/04-game-modes-thumb.webp" },
            { type: "image", title: "Single Player Setup", url: "/images/projects/flank/05-single-player-setup.webp", thumbnail: "/images/projects/flank/05-single-player-setup-thumb.webp" },
            { type: "image", title: "Built-In Interactive Tutorial", url: "/images/projects/flank/06-how-to-play.webp", thumbnail: "/images/projects/flank/06-how-to-play-thumb.webp" },
            { type: "image", title: "How to Play: Objective", url: "/images/projects/flank/07-objective.webp", thumbnail: "/images/projects/flank/07-objective-thumb.webp" },
            { type: "image", title: "How to Play: Movement", url: "/images/projects/flank/08-movement.webp", thumbnail: "/images/projects/flank/08-movement-thumb.webp" },
            { type: "image", title: "How to Play: Piece Captures", url: "/images/projects/flank/09-captures.webp", thumbnail: "/images/projects/flank/09-captures-thumb.webp" },
            { type: "image", title: "How to Play: Special Rules", url: "/images/projects/flank/10-special-rules.webp", thumbnail: "/images/projects/flank/10-special-rules-thumb.webp" }
        ]
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
        image: "/images/projects/echoes/01-dungeon.webp",
        thumbnail: "/images/projects/echoes/01-dungeon-thumb.webp",
        github: "https://github.com/JosephDriedger/echoes-of-the-forgotten-keep",
        demo: "https://github.com/JosephDriedger/echoes-of-the-forgotten-keep/releases/tag/v1.0.0",
        website: null,
        technologies: ["C++", "OpenGL", "GLFW", "GLM", "Assimp", "CMake"],
        media: [
            { type: "image", title: "Exploring the Dungeon as Skeleton Enemies Close In", url: "/images/projects/echoes/01-dungeon.webp", thumbnail: "/images/projects/echoes/01-dungeon-thumb.webp" },
            { type: "image", title: "Combat with the Health HUD", url: "/images/projects/echoes/02-combat.webp", thumbnail: "/images/projects/echoes/02-combat-thumb.webp" },
            { type: "image", title: "Engine Debug View Showing Collision Volumes", url: "/images/projects/echoes/03-collision-debug.webp", thumbnail: "/images/projects/echoes/03-collision-debug-thumb.webp" },
            { type: "image", title: "Title Screen", url: "/images/projects/echoes/04-title.webp", thumbnail: "/images/projects/echoes/04-title-thumb.webp" }
        ]
    },
    {
        id: 6,
        slug: "wayfindr-campus-navigation-app",
        title: "Wayfindr Campus Navigation App",
        shortDescription: "Campus navigation web app with Mapbox GL and automated testing.",
        description: "A web-based campus navigation app that lets BCIT students find and navigate between buildings and classrooms. Powered by Mapbox GL for interactive in-browser maps, with a Node.js and Express backend, EJS-rendered UI, and an automated testing suite to catch regressions early.",
        category: "Academic",
        type: "app",
        role: "UI Developer",
        status: "completed",
        image: "/images/projects/wayfindr/01-directions.webp",
        thumbnail: "/images/projects/wayfindr/01-directions-thumb.webp",
        github: "https://github.com/JosephDriedger/WayFindr-Campus-Navigation-App",
        demo: null,
        website: null,
        technologies: ["EJS", "CSS", "JavaScript", "Node.js", "Express.js", "Mapbox GL", "Firebase", "Python"],
        media: [
            { type: "image", title: "Walking Directions Between Two Rooms", url: "/images/projects/wayfindr/01-directions.webp", thumbnail: "/images/projects/wayfindr/01-directions-thumb.webp" },
            { type: "image", title: "Campus Overview with Every Mapped Building", url: "/images/projects/wayfindr/02-campus.webp", thumbnail: "/images/projects/wayfindr/02-campus-thumb.webp" },
            { type: "image", title: "A Building's Floor Plan and Room List", url: "/images/projects/wayfindr/03-floor-plan.webp", thumbnail: "/images/projects/wayfindr/03-floor-plan-thumb.webp" },
            { type: "image", title: "Home Page with Room Search", url: "/images/projects/wayfindr/04-home.webp", thumbnail: "/images/projects/wayfindr/04-home-thumb.webp" }
        ]
    },
    {
        id: 7,
        slug: "melodiproof-ai",
        title: "MelodiProof AI",
        shortDescription: "CNN model for detecting AI-generated music built with Python and TensorFlow.",
        description: "A machine learning classifier that detects AI-generated music in audio files. A convolutional neural network (CNN) is trained on audio datasets using Python and TensorFlow, producing a binary classification result with strong accuracy. Includes full training and evaluation pipelines for iterating on model performance.",
        category: "Academic",
        type: "ai",
        role: "AI & ML Engineer",
        status: "completed",
        image: "/images/projects/melodiproof/01-ai-detected.webp",
        thumbnail: "/images/projects/melodiproof/01-ai-detected-thumb.webp",
        github: "https://github.com/JosephDriedger/MelodiProof-AI",
        demo: "https://github.com/JosephDriedger/MelodiProof-AI/releases/tag/v1.0.0",
        website: null,
        technologies: ["Python", "TensorFlow", "CNN"],
        media: [
            { type: "image", title: "Detection Flags a Track as AI-Generated", url: "/images/projects/melodiproof/01-ai-detected.webp", thumbnail: "/images/projects/melodiproof/01-ai-detected-thumb.webp" },
            { type: "image", title: "Detection Clears a Track as Human-Made", url: "/images/projects/melodiproof/02-human-made.webp", thumbnail: "/images/projects/melodiproof/02-human-made-thumb.webp" },
            { type: "image", title: "Mel Spectrogram the CNN Classifies", url: "/images/projects/melodiproof/03-spectrogram.webp", thumbnail: "/images/projects/melodiproof/03-spectrogram-thumb.webp" }
        ]
    },
    {
        id: 11,
        slug: "ecocities-industry-project",
        title: "Ecocities Industry Project",
        shortDescription: "Industry-sponsored full-stack project using Next.js, Python, and MongoDB.",
        description: "An industry-sponsored web platform built for the BCIT Centre for Ecocities, enabling stakeholders to explore and interact with processed environmental footprint data. Features a Next.js frontend backed by a MongoDB database populated through a Python CSV data pipeline, with automated tests validating application reliability.",
        category: "Industry",
        type: "app",
        role: "Full-Stack Developer",
        status: "completed",
        image: "/images/projects/ecocities/01-emissions.webp",
        thumbnail: "/images/projects/ecocities/01-emissions-thumb.webp",
        github: null,
        demo: null,
        website: "https://archetypefootprints.commons.bcit.ca/",
        technologies: ["Next.js", "Python", "MongoDB"],
        media: [
            { type: "image", title: "Consumption-Based Emissions Inventory for Metro Vancouver", url: "/images/projects/ecocities/01-emissions.webp", thumbnail: "/images/projects/ecocities/01-emissions-thumb.webp" },
            { type: "image", title: "Ecological Footprint Breakdown and Earths Required", url: "/images/projects/ecocities/02-footprint.webp", thumbnail: "/images/projects/ecocities/02-footprint-thumb.webp" },
            { type: "image", title: "Switching Communities to View Victoria's Inventory", url: "/images/projects/ecocities/03-victoria.webp", thumbnail: "/images/projects/ecocities/03-victoria-thumb.webp" },
            { type: "image", title: "Typical Transportation Emissions in BC Communities", url: "/images/projects/ecocities/04-transportation.webp", thumbnail: "/images/projects/ecocities/04-transportation-thumb.webp" },
            { type: "image", title: "About the Data and Project Attributions", url: "/images/projects/ecocities/05-about.webp", thumbnail: "/images/projects/ecocities/05-about-thumb.webp" }
        ]
    },
    {
        id: 9,
        slug: "abalone-game",
        title: "Abalone Game",
        shortDescription: "Digital Abalone board game adaptation with AI decision-making, built in Python.",
        description: "A digital adaptation of the Abalone marble-pushing strategy board game, built for a class tournament. Features a fully playable implementation with an AI opponent driven by decision-making algorithms, faithful to the original rules. Built in Python with Pygame for rendering and Photoshop for custom UI assets.",
        category: "Academic",
        type: "game",
        role: "Gameplay Programmer",
        status: "completed",
        image: "/images/projects/abalone/01-ai-battle.webp",
        thumbnail: "/images/projects/abalone/01-ai-battle-thumb.webp",
        github: "https://github.com/JosephDriedger/Abalone-Game",
        demo: "https://github.com/JosephDriedger/Abalone-Game/releases/tag/v1.0.0",
        website: null,
        technologies: ["Python", "Pygame", "Photoshop"],
        media: [
            { type: "image", title: "AI Agents Battling Mid-Game, with the Live Move History", url: "/images/projects/abalone/01-ai-battle.webp", thumbnail: "/images/projects/abalone/01-ai-battle-thumb.webp" },
            { type: "image", title: "Game Setup: Opponent, Agent, Formation and Time Limits", url: "/images/projects/abalone/02-game-setup.webp", thumbnail: "/images/projects/abalone/02-game-setup-thumb.webp" }
        ]
    },
    {
        id: 13,
        slug: "lockin-ringers-website",
        title: "Lock-in' Ringers Website",
        shortDescription: "Website for a Canadian barbershop quartet built with Node.js, Express, and EJS.",
        description: "The official website for Lock-in' Ringers, a young Canadian barbershop quartet. Built on a Node.js and Express backend with EJS layouts and partials, it introduces the quartet and its members, explains the barbershop style, and lets visitors request bookings for events. The vintage design is drawn from the quartet's boater-hat logo, with animated barber-pole stripes, period signage typography, and a responsive layout.",
        category: "Personal",
        type: "website",
        role: "Developer",
        status: "in-progress",
        image: "/images/projects/lockin-ringers/01-home.webp",
        thumbnail: "/images/projects/lockin-ringers/01-home-thumb.webp",
        github: "https://github.com/JosephDriedger/Lockin-Ringers",
        demo: null,
        website: "https://lockinringers.ca/",
        technologies: ["Node.js", "Express.js", "EJS", "HTML5", "CSS", "JavaScript"],
        media: [
            { type: "image", title: "Home Page Hero Framed by Animated Barber Poles", url: "/images/projects/lockin-ringers/01-home.webp", thumbnail: "/images/projects/lockin-ringers/01-home-thumb.webp" },
            { type: "image", title: "What Is Barbershop? Section with the Four Voice Parts", url: "/images/projects/lockin-ringers/02-what-is-barbershop.webp", thumbnail: "/images/projects/lockin-ringers/02-what-is-barbershop-thumb.webp" },
            { type: "image", title: "About Page Story and Quartet Facts", url: "/images/projects/lockin-ringers/03-our-story.webp", thumbnail: "/images/projects/lockin-ringers/03-our-story-thumb.webp" },
            { type: "image", title: "Event Types the Quartet Performs At", url: "/images/projects/lockin-ringers/04-perform.webp", thumbnail: "/images/projects/lockin-ringers/04-perform-thumb.webp" },
            { type: "image", title: "Book a Show Booking Request Form", url: "/images/projects/lockin-ringers/05-book-a-show.webp", thumbnail: "/images/projects/lockin-ringers/05-book-a-show-thumb.webp" }
        ]
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
        P.THUMBNAIL_URL AS thumbnail,
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

// Finished projects come first, newest completion date first (a project with no
// end date falls back to its start date). In-progress projects follow, newest first.
const projectOrder = `
    ORDER BY
        (P.STATUS = 'In-Progress') ASC,
        COALESCE(P.END_DATE, P.START_DATE) DESC,
        P.START_DATE DESC,
        P.DISPLAY_ORDER ASC,
        P.ID DESC
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

    const media = (Array.isArray(project.media) ? project.media : [])
        .map((item) => ({
            ...item,
            url: resolveImage(item.url),
            thumbnail: resolveImage(item.thumbnail) || resolveImage(item.url)
        }))
        .filter((item) => String(item.type || "").toLowerCase() === "image" && item.url);

    const image = resolveImage(project.image);

    return {
        ...project,
        image,
        thumbnail: resolveImage(project.thumbnail) || image,
        technologies,
        media
    };
};

// Image paths may be stored as "/images/projects/x.png" or just "x.png".
// Paths that point at files missing from /public are dropped so the views
// fall back to a placeholder instead of rendering a broken image.
const resolveImage = (imagePath) =>
{
    if (!imagePath)
    {
        return null;
    }

    const value = String(imagePath).trim();

    if (/^https?:\/\//i.test(value))
    {
        return value;
    }

    const url = value.startsWith("/") ? value : `/images/projects/${value}`;

    return fs.existsSync(path.join(publicDir, url)) ? url : null;
};

const findMediaByProjectId = async (projectId) =>
{
    const [rows] = await db.query(
        `
        SELECT
            MEDIA_TYPE AS type,
            TITLE AS title,
            URL AS url,
            THUMBNAIL_URL AS thumbnail
        FROM PROJECT_MEDIA
        WHERE PROJECT_ID = ?
        ORDER BY DISPLAY_ORDER ASC, ID ASC
        `,
        [projectId]
    );

    return rows;
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
        ${projectOrder}
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
        ${projectOrder}
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

    if (!rows[0])
    {
        return null;
    }

    const media = await findMediaByProjectId(rows[0].id);

    return normalizeProject({ ...rows[0], media });
};