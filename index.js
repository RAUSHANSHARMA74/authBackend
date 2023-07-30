
const express = require("express")
const {connection} = require("./config/connection")
const {googleAuthRouter} = require("./auth/googleAuth")
const {githubAuthRouter} = require("./auth/githubAuth")
const {facebookAuthRouter} = require("./auth/facebookAuth")
const {twitterAuthRouter} = require("./auth/twitterAuth")
// const cors = require("cors")
require("dotenv").config()

const app = express()
// app.use(cors)
app.use(express.json())
app.use(googleAuthRouter)
app.use(githubAuthRouter)
app.use(facebookAuthRouter)
app.use(twitterAuthRouter)


let port = process.env.port || 5555
app.listen(port, async ()=>{
    try {
        await connection
        console.log("Connected to Database")
    } catch (error) {
        console.log("wrong in mongodb")
    }
    console.log(`server is running on port ${port}\nhttp://localhost:${port}/`)
})