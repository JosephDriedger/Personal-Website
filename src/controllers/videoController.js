const videoService = require('../services/videoService');

exports.getAllVideos = async (req, res) => {
    try {
        const filters = {
            title: req.query.title || ''
        };

        const videos = await videoService.getAllVideos(filters);

        res.render('videos', { 
            videos,
            filters
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};