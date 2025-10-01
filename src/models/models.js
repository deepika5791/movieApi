const mongoose = require("mongoose");
const { Movie } = require("../moviesController/movies");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: [String],
  year: Number,
  genre: [String],
  rating: Number,
  duration: Number,
  trailer: String,
  trailerThumbnail: String,
  poster: String,
  cast: [String],
});
const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
