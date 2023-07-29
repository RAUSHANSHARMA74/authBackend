const mongoose = require("mongoose")
const twitterSchema = mongoose.Schema({
    profile : Object
})
const TwitterModel = mongoose.model("Twitter", twitterSchema)
module.exports = {TwitterModel}