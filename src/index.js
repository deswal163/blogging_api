const express = require('express')
require('./db/mongoose')
const blog = require('./routers/blog')
const user = require('./routers/user')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(blog)
app.use(user)

app.listen(port, () => {
    console.log("server is running on port " + port);
})
