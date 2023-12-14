//const mongoose = require("mongoose");
import mongoose from 'mongoose';

const albumSchema = mongoose.Schema({
    name: String,
    year: Number,
    image: String,
    artist: String, //reference to artist id
});

//module.exports = mongoose.model("Album", albumSchema);
const Album = mongoose.model("Album", albumSchema);
export default Album;