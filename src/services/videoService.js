const videoModel = require("../models/videoModel");

exports.getAllVideos = async () =>
{
    return await videoModel.findAll();
};
