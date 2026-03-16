const http = require('http');
const sampleData = require('./sampler');

const server = http.createServer((req, res) => 
  {
  if (req.method === 'POST' && req.url === '/sample') 
  {
    let body = '';

    req.on('data', chunk => body += chunk);

    req.on('end', () => 
    {
      const data = JSON.parse(body);

      const sample = sampleData(data.voltage, data.amount);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(
      {
        status: "received",
        sample: sample
      }));
    });
  }
});

server.listen(3000);

console.log("Server running on http://localhost:3000");

module.exports = server;