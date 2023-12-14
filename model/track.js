//const mongoose = require("mongoose");
import mongoose from 'mongoose';

const trackSchema = mongoose.Schema({
    name: String,
    artist: String, //reference to artist id
    album: String //reference to album id
});

//module.exports = mongoose.model("Track", trackSchema);
const Track = mongoose.model("Track", trackSchema);
export default Track;