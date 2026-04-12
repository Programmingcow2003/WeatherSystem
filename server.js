const http = require('http');
const https = require('https');
const sampleData = require('./sampler');
const db = require('./db');

// Send one sampled voltage value to the Python Transformer
function sendToTransformer(voltage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ voltage });

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/transform',
      method: 'POST',
      rejectUnauthorized: false, // needed because Flask uses adhoc SSL
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error('Bad response from transformer: ' + body));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

// Helper to read request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  // 1) Sensor sends full voltage array here
  if (req.method === 'POST' && req.url === '/sample') {
    try {
      const data = await readBody(req);

      if (!Array.isArray(data.voltage) || typeof data.amount !== 'number') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Expected voltage array and numeric amount'
        }));
        return;
      }

      const sample = sampleData(data.voltage, data.amount);

      const transformed = await Promise.all(
        sample.map((value) => sendToTransformer(value))
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'received',
        sample,
        transformed
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Server error',
        details: err.message
      }));
    }

    return;
  }

  // 2) Transformer sends temperature here to be stored in DB
  if (req.method === 'POST' && req.url === '/temperature') {
    try {
      const data = await readBody(req);

      if (typeof data.temperature !== 'number' || !data.timestamp) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Expected numeric temperature and timestamp'
        }));
        return;
      }

      await db.query(
        'INSERT INTO temperature_readings (temperature, timestamp) VALUES ($1, $2)',
        [data.temperature, data.timestamp]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'stored',
        temperature: data.temperature,
        timestamp: data.timestamp
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Database error',
        details: err.message
      }));
    }

    return;
  }

  // 3) View saved records for the demo
  if (req.method === 'GET' && req.url === '/temperature') {
    try {
      const result = await db.query(
        'SELECT * FROM temperature_readings ORDER BY id DESC LIMIT 10'
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Database read error',
        details: err.message
      }));
    }

    return;
  }

  // Default route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

module.exports = { server, sendToTransformer };
