const mongoose = require("mongoose")
const googleSchema = mongoose.Schema({
    profile : Object
})
const GoogleModel = mongoose.model("Google", googleSchema)
module.exports = {GoogleModel}