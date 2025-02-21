const { Client } = require("pg");

const client = new Client({
  user: "danielhassett", // Update with your PostgreSQL user
  host: "localhost",
  database: "unit4career_db", // Database name
  password: "", // Add your password here if set
  port: 5432,
});

module.exports = { client };

// require("dotenv").config();
// const { Client } = require("pg");
// const client = new Client({
//   // made updates for .env
//   user: process.env.DB_USER, // Replace with your DB username
//   host: process.env.DB_HOST, // If you're running locally, leave it as 'localhost'
//   database: "unit4career_db", // Replace with your DB name
//   password: process.env.DB_PASSWORD, // Replace with your DB password
//   port: 5432, // Default PostgreSQL port is 5432

//   // original version
//   // user: "danielhassett",
//   // host: "localhost",
//   // database: "unit4career_db",
//   // password: "",
//   // port: 5432,
// });
// client.connect();
// module.exports = { client };
// const pg = require("pg");
// const client = new pg.Client(
//   process.env.DATABASE_URL || "postgres://localhost/unit4career_db"
// );

// module.exports = { client };
