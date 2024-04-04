const express = require('express');
const Blog = require('../models/blog')
const auth = require('../middleware/auth')

const router = new express.Router();

router.get('/blogs', auth, async (req, res) => {
    try {
        const blogs = await Blog.find({author: req.user._id})
        return res.send(blogs)
    } catch (e) {
        return res.status(500).send(e)
    }

})

router.post('/blogs/create', auth, async (req, res) => {
    try {
        const blog = await Blog({
            ...req.body,
            author: req.user._id
        })

        await blog.save()
        res.status(201).send(blog)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)

        if (!blog) {
            return res.status(404).send()
        }

        res.send(blog)
    } catch (e) {
        res.status(500).send(e)
    }
})

const likeBlog = async function(blog, user, like) {
    if (like) {
        if (!blog.likedBy.includes(user._id)) {
            blog.likedBy.push(user._id);
        }
    } else {
        blog.likedBy = blog.likedBy.filter(userId => userId != user._id);
    }
}

router.patch('/blogs/:id', auth, async (req, res) => {
    validOperations = ['title', 'body', 'like']
    userOperations = Object.keys(req.body)

    const isValid = userOperations.every( (operation) => {
        validOperations.includes(operation)
    })

    if (!isValid) {
        return res.status(400).send({
            error: "Invalid Operations."
        })
    }

    try {
        const blog = await Blog.findById(req.params.id)

        if (!blog) {
            return res.status(404).send()
        }

        if (userOperations == 'like') {
            likeBlog(blog, req.user, req.body.like)
            return res.send(blog);
        }

        if (blog.author != req.user._id) {
            return res.status(401).send("Not authoristed")
        }

        if (userOperations.includes('like')) {
            likeBlog(blog, req.user, req.body.like)
        }

        delete req.body.like

        userOperations.forEach(
            (operation) => {
                blog[operation] = req.body[operation]
            }
        )

        await blog.save()

        res.send(blog)
    } catch (e) {
        res.send(400).send(e)
    }
})


router.delete('/blogs/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findOneAndDelete( {
            _id: req.params.id,
            author: req.user.id
        })

        if (!blog) {
            return res.status(404).send()
        }

        res.send(blog)
    } catch (e) {
        res.send(500).send(e)
    }
})
// GET /blogs/users/:id?search=title
// GET /blogs/users/:id?limit=10&skip=0
// GET /blogs/users/:id?sortBy=createdBy:asec
router.get('/blogs/users/:id', async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.search) {
        match = {
            $text: {
                $search: req.query.search
            },
            author: req.params.id
        }
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = sort[parts[1]] === 'desc' ? -1: 1
    }

    try {
        const blogs = await Blog.find({
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })

        res.send(blogs)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/blogs/search', async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.search) {
        match = {
            $text: {
                $search: req.query.search
            }
        }
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = sort[parts[1]] === 'desc' ? -1: 1
    }

    try {
        const blogs = await Blog.find({
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })

        res.send(blogs)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router