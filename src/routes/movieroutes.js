const express = require("express");
const {
  MoviesStats,
  AllMovies,
  topMovies,
  // totalMovies,
  movieID,
  newMovie,
  deleteMovie,
  AlldeleteMovie,
  patchMovie,
  completeMovie,
  // getAverageRating,
} = require("./../moviesController/movies");
const router = express.Router();

router.get("/", AllMovies);
router.get("/top/:n", topMovies);
// router.get("/:average-rating", getAverageRating);
// router.get("/totalMovies", totalMovies);
router.get("/stats", MoviesStats);
router.get("/:id", movieID);
router.post("/", newMovie);
router.delete("/:id", deleteMovie);
router.delete("/", AlldeleteMovie);
router.patch("/:id", patchMovie);
router.put("/:id", completeMovie);

module.exports = router;
