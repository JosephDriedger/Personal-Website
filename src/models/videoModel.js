const db = require("../config/db");
const { extractYouTubeId, buildEmbedUrl } = require("../utils/youtube");

const useMockData =
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_DEV_DB !== "true";

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

function normalizeVideo(video)
{
    const youtubeId = extractYouTubeId(
        video.youtube_id ||
        video.video_id ||
        video.youtube_url ||
        video.url
    );

    return {
        id: video.id,
        title: video.title || "Untitled Video",
        description: video.description || "",
        youtube_id: youtubeId,
        embed_url: buildEmbedUrl(youtubeId),
        created_at: video.created_at || null
    };
}

exports.findAll = async () =>
{
    if (useMockData)
    {
        return mockVideos.map(normalizeVideo);
    }

    const [rows] = await db.query(`
        SELECT
            id,
            title,
            video_id,
            NULL AS description,
            created_at
        FROM VIDEOS
        ORDER BY created_at DESC, id DESC
    `);

    return rows
        .map(normalizeVideo)
        .filter((video) => Boolean(video.youtube_id));
};