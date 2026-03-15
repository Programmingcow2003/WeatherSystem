const express = require("express");
const sampleData = require("./sampler");

const app = express();
app.use(express.json());

app.post("/sample", (req, res) => {
  const data = req.body.data;
  const sampleSize = req.body.sampleSize;

  const sample = sampleData(data, sampleSize);

  res.json({ sample });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
