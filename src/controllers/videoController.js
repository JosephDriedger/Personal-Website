const videoService = require("../services/videoService");

exports.getVideos = async (req, res, next) =>
{
    try
    {
        const videos = await videoService.getAllVideos();

        res.render("pages/music-videos",
        {
            title: "Music Videos",
            videos
        });
    }
    catch (error)
    {
        next(error);
    }
};
