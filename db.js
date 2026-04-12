const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "weather",
  port: process.env.DB_PORT || 5432
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
