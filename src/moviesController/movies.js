const fs = require("fs");

const allMovies = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading data" });
      }
      let movies = JSON.parse(data);
      const { title, director, genre, year, cast, by, order } = req.query;
      if (title) {
        movies = movies.filter(
          (m) => m.title && m.title.toLowerCase().includes(title.toLowerCase())
        );
        if (movies.length === 0) {
          return res.status(500).json({ message: "no movie found", data: [] });
        }
      }
      if (director) {
        movies = movies.filter(
          (m) =>
            m.director &&
            m.director.toLowerCase().includes(director.toLowerCase())
        );
        if (movies.length === 0) {
          return res.status(500).json({ message: "no movie found", data: [] });
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
          return res.status(500).json({ message: "no movie found", data: [] });
        }
      }

      if (year) {
        movies = movies.filter(
          (m) => m.year && m.year.toString().trim() === year.trim()
        );
        if (movies.length === 0) {
          return res.status(500).json({ message: "no movie found", data: [] });
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
          return res.status(500).json({ message: "no movie found" , data:[] });
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
    });
  } catch (error) {
    console.log(error);
  }
};
const moviesStats = (req, res) => {
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

const topMovies = (req, res) => {
  try {
    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading data" });
      }
      let movies = JSON.parse(data);

      const n = parseInt(req.params.n);
      if (isNaN(n) || n <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid number provided", data: [] });
      }
      const movie = movies.find((p) => p.id === n);
      if (!movie) {
        return res.status(404).json({ message: "id is invalid", data: [] });
      }
      movies.sort((a, b) => b.rating - a.rating);
      const top = movies.slice(0, n);
      res.json({ message: "top movies", data: top });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const movieId = (req, res) => {
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
      res.send({ message: "all movie ID", data: movie });
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
    const bodyFields = Object.keys(req.body);
    const invalidFields = bodyFields.filter(
      (field) => !requiredFields.includes(field)
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields provided: ${invalidFields.join(", ")}`,
      });
    }

    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error reading data", data: [] });
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
          return res.status(500).json({ message: "Error saving movie data" });
        }
        res
          .status(201)
          .json({ message: "Movie added successfully!", data: movie });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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

const alldeleteMovie = (req, res) => {
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
    const movieID = parseInt(req.params.id);

    
    if (req.body.id !== undefined) {
      return res.status(400).json({
        message: `Cannot include 'id' in PATCH request. `,
      });
    }

    fs.readFile("movie.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error reading file" });
      }

      let movies = JSON.parse(data);
      const movie = movies.find((m) => m.id === movieID);

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      if (req.body.title !== undefined) movie.title = req.body.title;
      if (req.body.director !== undefined) movie.director = req.body.director;
      if (req.body.year !== undefined) movie.year = req.body.year;
      if (req.body.genre !== undefined) movie.genre = req.body.genre;
      if (req.body.rating !== undefined) movie.rating = req.body.rating;
      if (req.body.duration !== undefined) movie.duration = req.body.duration;
      if (req.body.trailer !== undefined) movie.trailer = req.body.trailer;
      if (req.body.trailerThumbnail !== undefined)
        movie.trailerThumbnail = req.body.trailerThumbnail;
      if (req.body.poster !== undefined) movie.poster = req.body.poster;
      if (req.body.cast !== undefined) movie.cast = req.body.cast;

      fs.writeFile("movie.json", JSON.stringify(movies, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing file" });
        }

        res.json({ message: "Movie successfully updated", data: movie });
      });
    });
  } catch (error) {
    console.error(error);
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
        message: `Missing required fields: ${missingFields.join(", ")}`, data:[]
      });
    }

    const bodyFields = Object.keys(req.body);
    const invalidFields = bodyFields.filter(
      (field) => !requiredFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields provided: ${invalidFields.join(", ")}`,
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

        res.json({
          message: "movie fields successfully updated",
          data: movies[index],
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
