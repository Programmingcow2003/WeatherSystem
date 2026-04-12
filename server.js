const http = require("http");
const https = require("https");
const sampleData = require("./sampler");
const db = require("./db");

// Send one sampled voltage value to the Python Transformer
function sendToTransformer(voltage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ voltage });

    const options = {
      hostname: "127.0.0.1",
      port: 5000,
      path: "/transform",
      method: "POST",
      rejectUnauthorized: false,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(new Error("Invalid response from Transformer: " + body));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

const server = http.createServer(async (req, res) => {
  // Sensor -> Sampler
  if (req.method === "POST" && req.url === "/sample") {
    try {
      const data = await readBody(req);

      if (!Array.isArray(data.voltage) || typeof data.amount !== "number") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: "Invalid input. Expected voltage array and numeric amount."
        }));
        return;
      }

      const sample = sampleData(data.voltage, data.amount);

      const transformedResults = await Promise.all(
        sample.map((value) => sendToTransformer(value))
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "received",
        sample: sample,
        transformed: transformedResults
      }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Server error",
        details: error.message
      }));
    }

    return;
  }

  // Transformer -> REST API -> Database
  if (req.method === "POST" && req.url === "/temperature") {
    try {
      const data = await readBody(req);

      if (typeof data.temperature !== "number" || !data.timestamp) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: "Expected numeric temperature and timestamp"
        }));
        return;
      }

      const result = await db.query(
        "INSERT INTO temperature_readings (temperature, timestamp) VALUES ($1, $2) RETURNING id",
        [data.temperature, data.timestamp]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "stored",
        id: result.rows[0].id
      }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Database error",
        details: error.message
      }));
    }

    return;
  }

  // For demo: view saved rows
  if (req.method === "GET" && req.url === "/temperature") {
    try {
      const result = await db.query(
        "SELECT * FROM temperature_readings ORDER BY id DESC LIMIT 10"
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result.rows));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Database read error",
        details: error.message
      }));
    }

    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

if (require.main === module) {
  server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = { server, sendToTransformer };
