const express = require("express");

const http = require("http");

const app = express();
const port = 5500;

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
