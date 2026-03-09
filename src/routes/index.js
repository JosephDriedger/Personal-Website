const express = require('express')
const router = express.Router()

const pageController = require('../controllers/pageController')

router.get('/', pageController.home)
router.get('/projects', pageController.projects)
router.get('/music-videos', pageController.musicVideos)
router.get('/about', pageController.about)
router.get('/contact', pageController.contact)

module.exports = router
