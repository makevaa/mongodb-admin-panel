//const mongoose = require("mongoose");
import mongoose from 'mongoose';

const artistSchema = mongoose.Schema({
    name: String,
    country: String
});

//module.exports = mongoose.model("Artist", artistSchema);
const Artist = mongoose.model("Artist", artistSchema);
export default Artist;