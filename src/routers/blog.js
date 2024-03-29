const express = require('express');
const Blog = require('../models/blog')
const router = new express.Router();

router.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find({})
        return res.send(blogs)
    } catch (e) {
        return res.status(500).send(e)
    }

})

router.post('/blogs/create', async (req, res) => {

})

module.exports = router