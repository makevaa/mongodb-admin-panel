//const mongoose = require("mongoose");
import mongoose from 'mongoose'

const playlistSchema = mongoose.Schema({
  name: String,
  desc: String,
  image: String,
  imageSmall: String,
  tracks: [String], //list of track ids
});

//module.exports = mongoose.model("Playlist", playlistSchema);
const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist 
