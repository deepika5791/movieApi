const fs = require("fs");
const MoviesStats = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading data" });
      }
      let movies = JSON.parse(data);
      let totalMovies = movies.length;

      const maxDuration = Math.max(...movies.map((m) => m.duration));
      movies = movies.filter((m) => m.duration === maxDuration);

      const totalRating = movies.reduce(
        (sum, movie) => sum + (movie.rating || 0),
        0
      );
      const avgRating = totalRating / movies.length;
      res.json({
        averageRating: avgRating.toFixed(2),
        totalMovies,
        maxDuration,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const AllMovies = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading data" });
      }
      let movies = JSON.parse(data);
      const { title, director, genre, year, cast, duration, by, order } =
        req.query;
      if (title) {
        movies = movies.filter(
          (m) => m.title && m.title.toLowerCase().includes(title.toLowerCase())
        );
        if (movies.length === 0) {
          return res.status(500).json({ message: "no movie found" });
        }
      }
      if (director) {
        movies = movies.filter(
          (m) =>
            m.director &&
            m.director.toLowerCase().includes(director.toLowerCase())
        );
        if (movies.length === 0) {
          return res.status(500).json({ message: "no movie found" });
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
          return res.status(500).json({ message: "no movie found" });
        }
      }

      if (year) {
        movies = movies.filter(
          (m) => m.year && m.year.toString().trim() === year.trim()
        );
        if (movies.length === 0) {
          return res.status(500).json({ message: "no movie found" });
        }
      }

      if (cast) {
        const castNames = cast.split(",").map((c) => c.toLowerCase().trim());
        movies = movies.filter(
          (m) =>
            Array.isArray(m.cast) &&
            m.cast.find((c) =>
              castNames.find((name) => c.toLowerCase().includes(name))
            )
        );
        if (movies.length === 0) {
          return res.status(500).json({ message: "no movie found" });
        }
      }

      if (by) {
        if (order === "desc") {
          movies.sort((a, b) => (a[by] > b[by] ? -1 : 1));
        } else {
          movies.sort((a, b) => (a[by] > b[by] ? 1 : -1));
        }
      }
      res.json(movies);
    });
  } catch (error) {
    console.log(error);
  }
};

const topMovies = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading data" });
      }
      let movies = JSON.parse(data);
      const n = parseInt(req.params.n);
      if (isNaN(n) || n <= 0) {
        return res.status(400).json({ message: "Invalid number provided" });
      }
      movies.sort((a, b) => b.rating - a.rating);
      const top = movies.slice(0, n);
      res.json(top);
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const movieID = (req, res) => {
  try {
    const productsID = parseInt(req.params.id);
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading data" });
      }
      const movies = JSON.parse(data);
      const movie = movies.find((p) => p.id === productsID);
      if (!movie) {
        return res.status(404).json({ message: "No movie Found" });
      }
      res.send(movie);
    });
  } catch (error) {
    console.log(error);
  }
};

const newMovie = (req, res) => {
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
      });
    }
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading data" });
      }
      let newMovies = JSON.parse(data);
      const movieExists = newMovies.some(
        (m) =>
          m.title.toLowerCase() === req.body.title.toLowerCase() &&
          m.year === req.body.year
      );

      if (movieExists) {
        return res
          .status(400)
          .json({ message: "Movie already exists in the database" });
      }
      const newId =
        newMovies.length > 0 ? Math.max(...newMovies.map((u) => u.id)) + 1 : 1;
      const movie = { id: newId, ...req.body };
      newMovies.push(movie);

      fs.writeFile("movie.json", JSON.stringify(newMovies), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error saving movie" });
        }
        res.status(201).json({ message: "New movie added", data: movie });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteMovie = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).send("Error reading file");
      }
      let deleteMovie = JSON.parse(data);
      const movieId = parseInt(req.params.id);
      const deletes = deleteMovie.filter((movie) => movie.id !== movieId);
      if (deleteMovie.length === deletes.length) {
        return res.status(404).json({ message: "Movie not found" });
      }
      fs.writeFile("movie.json", JSON.stringify(deletes), (err) => {
        if (err) {
          return res.status(500).send("Error writing file");
        }
        res.json({
          message: "Movie deleted successfully",
          data: deletes,
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const AlldeleteMovie = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).send("Error reading file");
      }
      let AlldeleteMovie = JSON.parse(data);
      if (AlldeleteMovie.length === 0) {
        return res.status(404).json({ message: "Movie not found" });
      }
      fs.writeFile("movie.json", JSON.stringify([]), (err) => {
        if (err) {
          return res.status(500).send("Error writing file");
        }
        res.json({ message: "Movie deleted successfully", data: [] });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const patchMovie = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading file" });
      }
      let movies = JSON.parse(data);
      const movieID = parseInt(req.params.id);
      const movie = movies.find((m) => m.id === movieID);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      if (req.body.title) movie.title = req.body.title;
      if (req.body.director) movie.director = req.body.director;
      if (req.body.year) movie.year = req.body.year;
      if (req.body.genre) movie.genre = req.body.genre;
      if (req.body.rating) movie.rating = req.body.rating;
      if (req.body.duration) movie.duration = req.body.duration;
      if (req.body.trailer) movie.trailer = req.body.trailer;
      if (req.body.trailerThumbnail)
        movie.trailerThumbnail = req.body.trailerThumbnail;
      if (req.body.poster) movie.poster = req.body.poster;
      if (req.body.cast) movie.cast = req.body.cast;

      fs.writeFile("movie.json", JSON.stringify(movies, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing file" });
        }
        res.json(movie);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const completeMovie = (req, res) => {
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
      });
    }
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading file" });
      }
      let movies = JSON.parse(data);
      const movieID = parseInt(req.params.id);
      const index = movies.findIndex((m) => m.id === movieID);
      if (index === -1) {
        return res.status(404).json({ message: "Movie not found" });
      }
      movies[index] = { id: movieID, ...req.body };
      fs.writeFile("movie.json", JSON.stringify(movies, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing file" });
        }

        res.json(movies[index]);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  MoviesStats,
  AllMovies,
  topMovies,
  movieID,
  newMovie,
  deleteMovie,
  AlldeleteMovie,
  patchMovie,
  completeMovie,
};
