const http = require("http");
const https = require("https");
const sampleData = require("./sampler");
const db = require("./db");

function reply(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readJson(req, done) {
  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      done(null, JSON.parse(body || "{}"));
    } catch {
      done("Invalid JSON");
    }
  });
}

function sendToTransformer(voltage, done) {
  const data = JSON.stringify({ voltage });

  const req = https.request(
    {
      hostname: "127.0.0.1",
      port: 5000,
      path: "/transform",
      method: "POST",
      rejectUnauthorized: false,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    },
    (res) => {
      let body = "";

      res.on("data", chunk => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          done(null, JSON.parse(body));
        } catch {
          done("Bad transformer response");
        }
      });
    }
  );

  req.on("error", err => done(err.message));
  req.write(data);
  req.end();
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/sample") {
    readJson(req, (err, data) => {
      if (err) return reply(res, 400, { error: err });
      if (!Array.isArray(data.voltage) || typeof data.amount !== "number") {
        return reply(res, 400, { error: "Invalid input" });
      }

      const sample = sampleData(data.voltage, data.amount);
      const transformed = [];
      let finished = 0;

      if (sample.length === 0) {
        return reply(res, 200, { status: "received", sample, transformed });
      }

      for (let i = 0; i < sample.length; i++) {
        sendToTransformer(sample[i], (err, result) => {
          transformed[i] = err ? { error: err } : result;
          finished++;

          if (finished === sample.length) {
            reply(res, 200, {
              status: "received",
              sample,
              transformed
            });
          }
        });
      }
    });
    return;
  }

  if (req.method === "POST" && req.url === "/temperature") {
    readJson(req, (err, data) => {
      if (err) return reply(res, 400, { error: err });
      if (typeof data.temperature !== "number" || !data.timestamp) {
        return reply(res, 400, { error: "Invalid input" });
      }

      db.query(
        "INSERT INTO temperature_readings (temperature, timestamp) VALUES ($1, $2) RETURNING id",
        [data.temperature, data.timestamp]
      )
        .then(result => {
          reply(res, 200, {
            status: "stored",
            id: result.rows[0].id
          });
        })
        .catch(err => {
          reply(res, 500, {
            error: "Database error",
            details: err.message
          });
        });
    });
    return;
  }

  if (req.method === "GET" && req.url === "/temperature") {
    db.query("SELECT * FROM temperature_readings ORDER BY id DESC LIMIT 10")
      .then(result => reply(res, 200, result.rows))
      .catch(err => reply(res, 500, {
        error: "Database read error",
        details: err.message
      }));
    return;
  }

  reply(res, 404, { error: "Not found" });
});

if (require.main === module) {
  server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = { server };