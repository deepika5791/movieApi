require("dotenv").config();
const mongoose = require("mongoose");
const { Movie } = require("./src/moviesController/movies");
const data = require("./movie.json");
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Movie.deleteMany({});
    await Movie.insertMany(data);
    console.log("Data imported");
    process.exit();
  })
  .catch(console.error);
