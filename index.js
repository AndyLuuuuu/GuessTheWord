const express = require("express");
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

let words = null;

fs.readFile("./newwords.txt", (err, contents) => {
  words = contents.toString().split("\n");
});

app.use(express.static(__dirname + "/client"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

app.get("/random", (req, res) => {
  res.send(words[Math.floor(Math.random() * words.length - 1)]);
});

app.listen(PORT, () => {
  console.log(`Server up on ${PORT}`);
});
