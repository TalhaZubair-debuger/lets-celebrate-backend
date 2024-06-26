const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
    image: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("User", userSchema);