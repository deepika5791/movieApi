const Movie = require("../models/models");
const allMovies = async (req, res) => {
  try {
    let movies = await Movie.find();
    const { title, director, year, genre, cast, by, order } = req.query;

    if (title) {
      movies = movies.filter(
        (m) => m.title && m.title.toLowerCase().includes(title.toLowerCase())
      );
      if (movies.length === 0) {
        return res.status(404).json({ message: "no movie found", data: [] });
      }
    }

    if (director) {
      movies = movies.filter(
        (m) =>
          Array.isArray(m.director) &&
          m.director.find((d) =>
            d.toLowerCase().includes(director.toLowerCase())
          )
      );
      if (movies.length === 0) {
        return res.status(404).json({ message: "no movie found", data: [] });
      }
    }

    if (genre) {
      const genres = genre.split(",").map((g) => g.toLowerCase());
      movies = movies.filter(
        (m) =>
          Array.isArray(m.genre) &&
          m.genre.find((g) => genres.includes(g.toLowerCase()))
      );
      if (movies.length === 0) {
        return res.status(404).json({ message: "no movie found", data: [] });
      }
    }

    if (year) {
      movies = movies.filter(
        (m) => m.year && m.year.toString().trim() === year.trim()
      );
      if (movies.length === 0) {
        return res.status(404).json({ message: "no movie found", data: [] });
      }
    }

    if (cast) {
      const castNames = cast.split(",").map((c) => c.toLowerCase().trim());
      movies = movies.filter(
        (m) =>
          Array.isArray(m.cast) &&
          m.cast.find((c) =>
            castNames.some((name) => c.toLowerCase().includes(name))
          )
      );
      if (movies.length === 0) {
        return res.status(404).json({ message: "no movie found", data: [] });
      }
    }

    if (by) {
      if (order === "desc") {
        movies.sort((a, b) => (a[by] > b[by] ? -1 : 1));
      } else {
        movies.sort((a, b) => (a[by] > b[by] ? 1 : -1));
      }
    }

    res.json({ message: "all movies to watch", data: movies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const moviesStats = async (req, res) => {
  try {
    const movies = await Movie.find();
    let totalMovies = movies.length;

    const maxDuration = Math.max(...movies.map((m) => m.duration || 0));

    const totalRating = movies.reduce(
      (sum, movie) => sum + (movie.rating || 0),
      0
    );
    const avgRating = movies.length ? totalRating / movies.length : 0;

    res.json({
      averageRating: avgRating.toFixed(2),
      totalMovies,
      maxDuration,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const topMovies = async (req, res) => {
  try {
    const n = parseInt(req.params.n);
    if (isNaN(n) || n <= 0) {
      return res.status(400).json({ message: "invalid number", data: [] });
    }
    const movies = await Movie.find().sort({ rating: -1 }).limit(n);
    res.json({ message: "top movies", data: movies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const movieId = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "No movie Found" });
    res.json({ message: "all movie ID", data: movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const newMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ message: "Movie added successfully", data: movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "No movie Found" });
    res.json({ message: "movie deleted successfully", data: movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const alldeleteMovie = async (req, res) => {
  try {
    const result = await Movie.deleteMany({});
    res.json({
      message: "all movies deleted successfully",
      deleted: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const patchMovie = async (req, res) => {
  try {
    if (req.body.id !== undefined) {
      return res
        .status(400)
        .json({ message: "Cannot include 'id' in PATCH request " });
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie successfully updated", data: movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeMovie = async (req, res) => {
  try {
    const requiredFields = [
      "title",
      "director",
      "year",
      "genre",
      "rating",
      "duration",
      "trailer",
      "trailerThumbnail",
      "poster",
      "cast",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        data: [],
      });
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie successfully updated", data: movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  Movie,
  moviesStats,
  allMovies,
  topMovies,
  movieId,
  newMovie,
  deleteMovie,
  alldeleteMovie,
  patchMovie,
  completeMovie,
};
