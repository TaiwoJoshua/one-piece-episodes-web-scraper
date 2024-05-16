const PORT = 8000;
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const scraper = require("./scraper");

app.get("/", function (req, res) {
  res.send("Happy web scraping");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

scraper();