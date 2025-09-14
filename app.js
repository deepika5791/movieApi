const express = require("express");
const cors = require("cors");
const moviesRouter = require("./src/routes/movieroutes");
const app = express();
const bodyParser = require("body-parser");
app.use(
  cors({
    origin: [
      "http://localhost:5173", // for local dev
      "https://fronted-movie-app.vercel.app", // for deployed frontend
    ],
  })
);
app.use(bodyParser.json());
app.use("/movies", moviesRouter);

module.exports = app;
