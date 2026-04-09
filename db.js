const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'weather',
  port: 5432
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};