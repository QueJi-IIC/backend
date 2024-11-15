const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const { firestore } = require("./utils/firebase-admin");

const http = require("http");

const app = express();
const port = 5500;

const server = http.createServer(app);

const ORS_API_KEY = "5b3ce3597851110001cf62483def44912c544f018818c7750ac93839";

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.post("/api/distance-matrix", async (req, res) => {
  const { origins, destinations } = req.body;

  const url = "https://api.openrouteservice.org/v2/matrix/driving-car";

  const data = {
    locations: [...origins, ...destinations],
    metrics: ["distance", "duration"],
    sources: Array.from(Array(origins.length).keys()),
    destinations: Array.from(Array(destinations.length).keys()),
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from ORS:", error.message);
    res.status(500).json({ error: "Failed to fetch data from ORS." });
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
