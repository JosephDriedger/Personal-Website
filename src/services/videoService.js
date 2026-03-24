const videoModel = require('../models/videoModel');

exports.getAllVideos = async (filters) => {
    return await videoModel.findAll(filters);
};