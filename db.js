const { client } = require("./common");

// Get all cars (removed references to the 'body' table)
const getCars = async () => {
  const SQL = `
    SELECT cars.name, cars.id as cars_id
    FROM cars
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// Get all reviews for a specific car
const getReviewsForCar = async (carId) => {
  const SQL = `
    SELECT reviews.review_text, reviews.score, users.username
    FROM reviews
    INNER JOIN users ON reviews.user_id = users.id
    WHERE reviews.car_id = $1
  `;
  const response = await client.query(SQL, [carId]);
  return response.rows;
};

// Get the average score for a car
const getAverageScoreForCar = async (carId) => {
  const SQL = `
    SELECT AVG(score) as average_score
    FROM reviews
    WHERE car_id = $1
  `;
  const response = await client.query(SQL, [carId]);
  return response.rows[0].average_score || 0;
};

module.exports = { getCars, getReviewsForCar, getAverageScoreForCar };
// const { client } = require("./common");

// const getCarsWithBody = async () => {
//   const SQL = `
//     SELECT cars.name, body.type, cars.id as cars_id, body.id as body_id
//     FROM cars
//     INNER JOIN body ON body.id = cars.body_id
//   `;
//   const response = await client.query(SQL);
//   return response.rows;
// };

// module.exports = { getCarsWithBody };

// 1st try
// const { client } = require("./common");

// const getCarsWithBody = async () => {
//   const SQL = `
//       SELECT cars.name, body.type, cars.id as cars_id, body.id as body_id
//     FROM cars
//     INNER JOIN cars_body on cars_body.cars_id = cars.id
//     INNER JOIN body on body.id =cars_body.body_id
//     `;
//   const response = await client.query(SQL);
//   return response.rows;
// };
// module.exports = { getCarsWithBody };

// Original
// module.exports = { getMoviesWithGenre, changeMovieGenre, deleteGenre };
// const changeMovieGenre = async (id, oldGenre, newGenre) => {
//   const SQL = `
//     update movies_genre
//     SET genre_id = (SELECT id from genre where type = $3)
//     WHERE genre_id = (SELECT id from genre where type = $2)
//     AND movie_id = $1
//     RETURNING *
//   `;
//   const response = await client.query(SQL, [id, oldGenre, newGenre]);
//   return response.rows;
// };

// const deleteGenre = async (id) => {
//   const SQL = `
//     DELETE from genre
//     WHERE id = $1
//   `;
//   const response = await client.query(SQL, [id]);
//   return response.rows;
// };
