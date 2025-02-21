require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { client } = require("./common");
const { getCars, getReviewsForCar, getAverageScoreForCar } = require("./db");
const uuid = require("uuid");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(morgan("dev"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing");
  process.exit(1);
}

const authenticateJWT = (req, res, next) => {
  const token =
    req.header("Authorization") &&
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

// Route to search for cars by name
app.get("/search-cars", async (req, res) => {
  const { query } = req.query; // Assuming the search term comes as a query parameter (e.g., ?query=Acura)

  const SQL = `
    SELECT cars.name, cars.id, cars.make, cars.model
    FROM cars
    WHERE cars.name ILIKE $1 OR cars.make ILIKE $1 OR cars.model ILIKE $1
  `;

  try {
    const response = await client.query(SQL, [`%${query}%`]);
    res.json(response.rows); // Return the list of cars matching the search
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to fetch reviews for a specific car by car_id
app.get("/car-reviews/:carId", async (req, res) => {
  const { carId } = req.params;

  const SQL = `
    SELECT reviews.review_text, reviews.score, users.username 
    FROM reviews 
    JOIN users ON reviews.user_id = users.id
    WHERE reviews.car_id = $1
  `;

  try {
    const response = await client.query(SQL, [carId]);
    res.json(response.rows); // Return the list of reviews for the car
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Internal Server Error");
  }
});

// User Routes
// POST /api/auth/register
app.post(
  "/api/auth/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await client.query(
        "INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [uuid.v4(), username, email, hashedPassword]
      );
      const user = result.rows[0];
      res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
// app.post("/api/auth/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     const result = await client.query(
//       "INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
//       [uuid.v4(), username, email, hashedPassword]
//     );
//     const user = result.rows[0];
//     res.status(201).json({ message: "User registered successfully", user });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      "your_jwt_secret",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Logged in successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// GET /api/auth/me 🔒
app.get("/api/auth/me", authenticateJWT, async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    const user = result.rows[0];
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Item (Car) Routes
// GET /api/items
app.get("/api/items", async (req, res) => {
  const { page = 1, limit = 10, make, model } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageLimit = parseInt(limit, 10);

  let filterConditions = [];
  let filterValues = [];

  if (make) {
    filterConditions.push("cars.make ILIKE $1");
    filterValues.push(`%${make}%`);
  }
  if (model) {
    filterConditions.push("cars.model ILIKE $2");
    filterValues.push(`%${model}%`);
  }

  const offset = (pageNumber - 1) * pageLimit;
  const limitClause = `LIMIT $${filterValues.length + 1} OFFSET $${
    filterValues.length + 2
  }`;

  const SQL = `
    SELECT * FROM cars
    ${
      filterConditions.length > 0
        ? "WHERE " + filterConditions.join(" AND ")
        : ""
    }
    ${filterConditions.length > 0 ? "AND" : "WHERE"} true
    ${limitClause}
  `;

  try {
    const response = await client.query(SQL, [
      ...filterValues,
      pageLimit,
      offset,
    ]);
    res.status(200).json(response.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// app.get("/api/items", async (req, res) => {
//   try {
//     const result = await client.query("SELECT * FROM cars");
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
// GET /api/items/:itemId
app.get("/api/items/:itemId", async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await client.query("SELECT * FROM cars WHERE id = $1", [
      itemId,
    ]);
    const car = result.rows[0];
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// GET /api/items/:itemId/reviews
app.get("/api/items/:itemId/reviews", async (req, res) => {
  const { itemId } = req.params;

  try {
    const result = await client.query(
      "SELECT reviews.review_text, reviews.score, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.car_id = $1",
      [itemId]
    );

    if (result.rows.length === 0) {
      return res
        .status(200)
        .json({ message: "No reviews yet, will you be the first?" });
    }

    res.status(200).json(result.rows); // Return the list of reviews for the car
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// app.get("/api/items/:itemId/reviews", async (req, res) => {
//   const { itemId } = req.params;
//   try {
//     const result = await client.query(
//       "SELECT * FROM reviews WHERE car_id = $1",
//       [itemId]
//     );
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// Review Routes
// GET /api/items/:itemId/reviews/:reviewId
app.get("/api/items/:itemId/reviews/:reviewId", async (req, res) => {
  const { itemId, reviewId } = req.params;
  try {
    const result = await client.query(
      "SELECT * FROM reviews WHERE car_id = $1 AND id = $2",
      [itemId, reviewId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// Post /api/items/:itemId/reviews/

app.post("/api/items/:itemId/reviews", authenticateJWT, async (req, res) => {
  const { itemId } = req.params;
  const { reviewText, score } = req.body;
  const userId = req.user.id;

  if (!reviewText || reviewText.trim() === "") {
    return res.status(400).json({ message: "Review text is required." });
  }

  if (score < 1 || score > 5) {
    return res.status(400).json({ message: "Score must be between 1 and 5." });
  }

  try {
    const result = await client.query(
      "INSERT INTO reviews (user_id, car_id, review_text, score) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, itemId, reviewText, score]
    );
    const review = result.rows[0];
    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// app.post("/api/items/:itemId/reviews", authenticateJWT, async (req, res) => {
//   const { itemId } = req.params;
//   const { reviewText, score } = req.body;
//   const userId = req.user.id;

//   try {
//     const result = await client.query(
//       "INSERT INTO reviews (user_id, car_id, review_text, score) VALUES ($1, $2, $3, $4) RETURNING *",
//       [userId, itemId, reviewText, score]
//     );
//     const review = result.rows[0];
//     res.status(201).json({ message: "Review added successfully", review });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// GET /api/reviews/me 🔒
app.get("/api/reviews/me", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await client.query(
      "SELECT * FROM reviews WHERE user_id = $1",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/users/:userId/reviews/:reviewId 🔒
app.put(
  "/api/users/:userId/reviews/:reviewId",
  authenticateJWT,
  async (req, res) => {
    const { userId, reviewId } = req.params;
    const { reviewText, score } = req.body;

    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden. You can only update your own reviews." });
    }

    if (!reviewText || reviewText.trim() === "") {
      return res.status(400).json({ message: "Review text is required." });
    }

    if (score < 1 || score > 5) {
      return res
        .status(400)
        .json({ message: "Score must be between 1 and 5." });
    }

    try {
      const result = await client.query(
        "UPDATE reviews SET review_text = $1, score = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
        [reviewText, score, reviewId, userId]
      );

      // Check if the review exists
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Review not found or you are not the owner of the review.",
        });
      }

      // Return the updated review
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
// app.put(
//   "/api/users/:userId/reviews/:reviewId",
//   authenticateJWT,
//   async (req, res) => {
//     const { userId, reviewId } = req.params;
//     const { reviewText, score } = req.body;
//     if (req.user.id !== userId) {
//       return res.status(403).json({ message: "Forbidden" });
//     }
//     try {
//       const result = await client.query(
//         "UPDATE reviews SET review_text = $1, score = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
//         [reviewText, score, reviewId, userId]
//       );
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Review not found" });
//       }
//       res.status(200).json(result.rows[0]);
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// Comments routes
// POST /api/items/:itemId/reviews/:reviewId/comments 🔒
app.post(
  "/api/items/:itemId/reviews/:reviewId/comments",
  authenticateJWT,
  async (req, res) => {
    const { reviewId } = req.params;
    const { commentText } = req.body;
    const userId = req.user.id;
    try {
      const result = await client.query(
        "INSERT INTO comments (user_id, review_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
        [userId, reviewId, commentText]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
// GET /api/comments/me 🔒
app.get("/api/comments/me", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await client.query(
      "SELECT * FROM comments WHERE user_id = $1",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// PUT /api/users/:userId/comments/:commentId 🔒
app.put(
  "/api/users/:userId/comments/:commentId",
  authenticateJWT,
  async (req, res) => {
    const { userId, commentId } = req.params;
    const { commentText } = req.body;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const result = await client.query(
        "UPDATE comments SET comment_text = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
        [commentText, commentId, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
// DELETE /api/users/:userId/comments/:commentId 🔒
app.delete(
  "/api/users/:userId/comments/:commentId",
  authenticateJWT,
  async (req, res) => {
    const { userId, commentId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const result = await client.query(
        "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *",
        [commentId, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// DELETE /api/users/:userId/reviews/:reviewId 🔒
app.delete(
  "/api/users/:userId/reviews/:reviewId",
  authenticateJWT,
  async (req, res) => {
    const { userId, reviewId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const result = await client.query(
        "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
        [reviewId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
// cleanly shut down the connection
process.on("SIGINT", () => {
  client.end(() => {
    console.log("Database connection closed");
    process.exit(0);
  });
});

// Start the server after the connection is established
client
  .connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  });

//2-18 edit 1 - works with postico
// // Required Dependencies
// const express = require("express");
// const morgan = require("morgan");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { Client } = require("./common");
// const { getCars, getReviewsForCar, getAverageScoreForCar } = require("./db");
// const uuid = require("uuid");

// // Initialize Express App
// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(express.json()); // for parsing JSON bodies
// app.use(morgan("dev")); // for logging requests

// // PostgreSQL Client Setup
// // const client = new Client({
// //   user: "danielhassett", // Update with your PostgreSQL user
// //   host: "localhost",
// //   database: "unit4career_db", // Database name
// //   password: "", // Add your password here if set
// //   port: 5432,
// // });
// // client.connect();

// // Authentication Middleware
// const authenticateJWT = (req, res, next) => {
//   const token =
//     req.header("Authorization") &&
//     req.header("Authorization").replace("Bearer ", "");

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Access denied. No token provided." });
//   }

//   jwt.verify(token, "your_jwt_secret", (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: "Forbidden" });
//     }
//     req.user = user;
//     next();
//   });
// };

// // Route to search for cars by name
// app.get("/search-cars", async (req, res) => {
//   const { query } = req.query; // Assuming the search term comes as a query parameter (e.g., ?query=Acura)

//   const SQL = `
//     SELECT cars.name, cars.id, cars.make, cars.model
//     FROM cars
//     WHERE cars.name ILIKE $1 OR cars.make ILIKE $1 OR cars.model ILIKE $1
//   `;

//   try {
//     const response = await client.query(SQL, [`%${query}%`]);
//     res.json(response.rows); // Return the list of cars matching the search
//   } catch (error) {
//     console.error("Error fetching cars:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Route to fetch reviews for a specific car by car_id
// app.get("/car-reviews/:carId", async (req, res) => {
//   const { carId } = req.params;

//   const SQL = `
//     SELECT reviews.review_text, reviews.score, users.username
//     FROM reviews
//     JOIN users ON reviews.user_id = users.id
//     WHERE reviews.car_id = $1
//   `;

//   try {
//     const response = await client.query(SQL, [carId]);
//     res.json(response.rows); // Return the list of reviews for the car
//   } catch (error) {
//     console.error("Error fetching reviews:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // User Routes
// app.post("/api/auth/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     const result = await client.query(
//       "INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
//       [uuid.v4(), username, email, hashedPassword]
//     );
//     const user = result.rows[0];
//     res.status(201).json({ message: "User registered successfully", user });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// app.post("/api/auth/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const result = await client.query("SELECT * FROM users WHERE email = $1", [
//       email,
//     ]);
//     const user = result.rows[0];

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);

//     if (!validPassword) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: user.id, username: user.username },
//       "your_jwt_secret",
//       {
//         expiresIn: "1h",
//       }
//     );

//     res.status(200).json({ message: "Logged in successfully", token });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// app.get("/api/auth/me", authenticateJWT, async (req, res) => {
//   try {
//     const result = await client.query("SELECT * FROM users WHERE id = $1", [
//       req.user.id,
//     ]);
//     const user = result.rows[0];
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Car Routes
// app.get("/api/items", async (req, res) => {
//   try {
//     const result = await client.query("SELECT * FROM cars");
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// app.get("/api/items/:itemId", async (req, res) => {
//   const { itemId } = req.params;
//   try {
//     const result = await client.query("SELECT * FROM cars WHERE id = $1", [
//       itemId,
//     ]);
//     const car = result.rows[0];
//     if (!car) {
//       return res.status(404).json({ message: "Car not found" });
//     }
//     res.status(200).json(car);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// app.get("/api/items/:itemId/reviews", async (req, res) => {
//   const { itemId } = req.params;
//   try {
//     const result = await client.query(
//       "SELECT * FROM reviews WHERE car_id = $1",
//       [itemId]
//     );
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Review Routes
// app.post("/api/items/:itemId/reviews", authenticateJWT, async (req, res) => {
//   const { itemId } = req.params;
//   const { reviewText, score } = req.body;
//   const userId = req.user.id;

//   try {
//     const result = await client.query(
//       "INSERT INTO reviews (user_id, car_id, review_text, score) VALUES ($1, $2, $3, $4) RETURNING *",
//       [userId, itemId, reviewText, score]
//     );
//     const review = result.rows[0];
//     res.status(201).json({ message: "Review added successfully", review });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// app.put(
//   "/api/users/:userId/reviews/:reviewId",
//   authenticateJWT,
//   async (req, res) => {
//     const { reviewId, userId } = req.params;
//     const { reviewText, score } = req.body;

//     if (userId !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to edit this review" });
//     }

//     try {
//       const result = await client.query(
//         "UPDATE reviews SET review_text = $1, score = $2 WHERE id = $3 RETURNING *",
//         [reviewText, score, reviewId]
//       );
//       const updatedReview = result.rows[0];
//       res
//         .status(200)
//         .json({ message: "Review updated successfully", updatedReview });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// app.delete(
//   "/api/users/:userId/reviews/:reviewId",
//   authenticateJWT,
//   async (req, res) => {
//     const { reviewId, userId } = req.params;

//     if (userId !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to delete this review" });
//     }

//     try {
//       await client.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
//       res.status(200).json({ message: "Review deleted successfully" });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// // Comment Routes
// app.post(
//   "/api/items/:itemId/reviews/:reviewId/comments",
//   authenticateJWT,
//   async (req, res) => {
//     const { itemId, reviewId } = req.params;
//     const { commentText } = req.body;
//     const userId = req.user.id;

//     try {
//       const result = await client.query(
//         "INSERT INTO comments (user_id, review_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
//         [userId, reviewId, commentText]
//       );
//       const comment = result.rows[0];
//       res.status(201).json({ message: "Comment added successfully", comment });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// app.get("/api/comments/me", authenticateJWT, async (req, res) => {
//   try {
//     const result = await client.query(
//       "SELECT * FROM comments WHERE user_id = $1",
//       [req.user.id]
//     );
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// app.put(
//   "/api/users/:userId/comments/:commentId",
//   authenticateJWT,
//   async (req, res) => {
//     const { commentId, userId } = req.params;
//     const { commentText } = req.body;

//     if (userId !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to edit this comment" });
//     }

//     try {
//       const result = await client.query(
//         "UPDATE comments SET comment_text = $1 WHERE id = $2 RETURNING *",
//         [commentText, commentId]
//       );
//       const updatedComment = result.rows[0];
//       res
//         .status(200)
//         .json({ message: "Comment updated successfully", updatedComment });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// app.delete(
//   "/api/users/:userId/comments/:commentId",
//   authenticateJWT,
//   async (req, res) => {
//     const { commentId, userId } = req.params;

//     if (userId !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to delete this comment" });
//     }

//     try {
//       await client.query("DELETE FROM comments WHERE id = $1", [commentId]);
//       res.status(200).json({ message: "Comment deleted successfully" });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// // Start Server
// app.listen(PORT, async () => {
//   await client.connect();
//   console.log(`I am listening on port number ${PORT}`);
// });

// original
// const { client } = require("./common");
// const express = require("express");
// const app = express();
// app.use(express.json());
// const PORT = 3000;
// app.use(require("morgan")("dev"));

// // const { getMoviesWithGenre, changeMovieGenre, deleteGenre } = require("./db");
// const { getCarsWithBody } = require("./db");

// app.get("/getAll", async (req, res, next) => {
//   try {
//     // Fetch the car data with body type info
//     const carsWithBody = await getCarsWithBody();

//     // Send the data as a JSON response
//     res.status(200).json(carsWithBody);
//   } catch (error) {
//     // Forward the error to error-handling middleware
//     next(error);
//   }
// });

// app.put("/changeGenre/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { oldGenre, newGenre } = req.body;
//     res.status(200).json(await changeMovieGenre(id, oldGenre, newGenre));
//   } catch (error) {
//     next(error);
//   }
// });

// app.delete("/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     await deleteGenre(id);
//     res.sendStatus(204);
//   } catch (error) {
//     next(error);
//   }
// });
// app.listen(PORT, async () => {
//   await client.connect();
//   console.log(`I am listening on port number ${PORT}`);
// });
