const db = require("../config/db");

const devMode = process.env.DEV_MODE === "true";

const mockVideos = [
    {
        id: 1,
        title: "Cinematic Music Video 1",
        description: "A sample featured music video pulled from mock data.",
        youtube_id: "dQw4w9WgXcQ"
    },
    {
        id: 2,
        title: "Performance Video 2",
        description: "Another placeholder YouTube video for frontend testing.",
        youtube_id: "3JZ_D3ELwOQ"
    },
    {
        id: 3,
        title: "Creative Edit 3",
        description: "Mock content so the music videos page renders without the database.",
        youtube_id: "L_jWHffIx5E"
    }
];

exports.findAll = async () =>
{
    if (devMode)
    {
        return mockVideos;
    }

    const [rows] = await db.query(
        "SELECT * FROM videos ORDER BY created_at DESC"
    );

    return rows;
};