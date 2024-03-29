const express = require("express")
const auth = require('../middleware/auth')
const User = require("../models/user")

const router = new express.Router()

router.post('/users', async (req, res) => {
    delete req.body.articles
    const user = new User(req.body)
    try {
        await user.save();
        const token = await user.generateAuthToken()

        return res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken();

        res.send({user, token})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token != req.token
        )

        await req.user.save();
        res.send()
    } catch (e) {
        res.send(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            throw new Error();
        }
        res.send(user)
    } catch (e) {
        res.status(404).send()
    }
})

router.post('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updateOperations = Object.keys(req.body)
    const validOperations = ['name', 'email', 'age', 'password'];

    const isValidOperations = updateOperations.every(
        (operation) => validOperations.includes(operation)
    );

    if (!isValidOperations) {
        res.status(400).send({
            error: "Invalid operations."
        })
    }

    try {
        updateOperations.forEach(
            (update) => req.user[update] = req.body[update]
        )

        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router