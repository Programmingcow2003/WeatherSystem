const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "randomuser",
  password: "1234",
  database: "weather",
  port: 5433
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};