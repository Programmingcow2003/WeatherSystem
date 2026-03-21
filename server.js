const http = require('http');
const https = require('https');
const sampleData = require('./sampler');

function sendToTransformer(voltage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ voltage });

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/transform',
      method: 'POST',
      rejectUnauthorized: false,
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
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(new Error('Invalid response from Transformer: ' + body));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/sample') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!Array.isArray(data.voltage) || typeof data.amount !== 'number') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Invalid input. Expected voltage array and numeric amount.'
          }));
          return;
        }

        const sample = sampleData(data.voltage, data.amount);

        const transformedResults = await Promise.all(
          sample.map((value) => sendToTransformer(value))
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'received',
          sample: sample,
          transformed: transformedResults
        }));
      } catch (error) {
        console.error('Server error:', error);

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Server error',
          details: error.message
        }));
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000);

console.log('Server running on http://localhost:3000');

module.exports = { server, sendToTransformer };