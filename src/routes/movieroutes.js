const express = require("express");
const {
  allMovies,
  topMovies,
  moviesStats,
  movieId,
  newMovie,
  deleteMovie,
  alldeleteMovie,
  patchMovie,
  completeMovie,
} = require("./../moviesController/movies");
const router = express.Router();

router.get("/", allMovies);
router.get("/sort", allMovies);
router.get("/top/:n", topMovies);
router.get("/stats", moviesStats);
router.get("/:id", movieId);
router.post("/", newMovie);
router.delete("/:id", deleteMovie);
router.delete("/", alldeleteMovie);
router.patch("/:id", patchMovie);
router.put("/:id", completeMovie);

module.exports = router;
