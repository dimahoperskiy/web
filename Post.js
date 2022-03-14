const mongoose = require("mongoose")

const PostSchema = mongoose.Schema({
    name: String,
    number: String,
    email: String,
    gender: String,
    dateOfBirth: String,
    yearsInRegion: Number,
    profession: String,
    workingForGovernment: Boolean,
    jobYears: Number,
    hasBankAccount: Boolean,
    hasRealEstate: Boolean,
    hasInsurance: Boolean
})

module.exports = mongoose.model('Post', PostSchema)