const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const app = express();
const PORT = process.env.PORT || 3000;

let words = null;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to DB!");
  }
});

fs.readFile("./newwords.txt", (err, contents) => {
  words = contents.toString().split("\n");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/client"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

app.get("/random", (req, res) => {
  res.send(words[Math.floor(Math.random() * words.length - 1)]);
});

app.post("/submitscore", (req, res) => {
  let name = req.body.name;
  let score = req.body.score;
  client.query(
    "INSERT INTO highscore (name, score) VALUES ($1, $2)",
    [name, score],
    (err, result) => {
      if (result) {
        res.sendStatus(200);
      }
    }
  );
});

app.get("/highscores", (req, res) => {
  client.query(
    "SELECT * FROM highscore ORDER BY score desc",
    [],
    (err, result) => {
      res.send(result.rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server up on ${PORT}`);
});
