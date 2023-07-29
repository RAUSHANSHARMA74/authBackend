const mongoose = require("mongoose")
const githubSchema = mongoose.Schema({
    profile : Object
})
const GithubModel = mongoose.model("Github", githubSchema)
module.exports = {GithubModel}