const express = require("express");
const cors = require("cors");
const moviesRouter = require("./src/routes/movieroutes");
const app = express();
const bodyParser = require("body-parser");
app.use(cors())
app.use(bodyParser.json());
app.use("/movies", moviesRouter);

module.exports = app;
