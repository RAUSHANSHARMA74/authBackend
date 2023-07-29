const mongoose = require("mongoose")
const facebookSchema = mongoose.Schema({
    profile : Object
})
const FacebookModel = mongoose.model("Facebook", facebookSchema)
module.exports = {FacebookModel}