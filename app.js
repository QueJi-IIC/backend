const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const verifyToken = require("./middlewares/auth");
const verifySocketToken = require("./middlewares/socketAuth");
const { firestore } = require("./utils/firebase-admin");
const axios = require("axios");

const app = express();
const port = 5500;

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// socket
io.use(verifySocketToken);

io.on("connection", (socket) => {
  console.log("A user connected", socket.store_id);
  socket.on("detection_status", async (event) => {
    try {
      const statusData = {
        id: socket.store_id,
        status: event.detected,
        timestamp: new Date().toISOString(),
      };
      console.log(statusData);
      await firestore.collection("status").add(statusData);
      console.log("Status added to Firestore:", statusData);
    } catch (error) {
      console.error("Error adding status to Firestore:", error);
    }
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const ORS_API_KEY = "5b3ce3597851110001cf62483def44912c544f018818c7750ac93839";

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.post("/hardware/:store_id", verifyToken, async (req, res) => {
  try {
    const { store_id } = req.params;
    const userId = req.user.uid;
    console.log(userId);

    const storeDoc = await firestore.collection("stores").doc(store_id).get();
    if (!storeDoc.exists || storeDoc.data().created_by !== userId) {
      return res
        .status(403)
        .json({ error: "Store does not belong to the user" });
    }

    const hardwareQuerySnapshot = await firestore
      .collection("hardware")
      .where("store_id", "==", store_id)
      .get();
    if (!hardwareQuerySnapshot.empty) {
      return res
        .status(400)
        .json({ error: "Hardware already exists for this store" });
    }

    const client_id = uuidv4();
    const client_secret = jwt.sign({ client_id }, "your_jwt_secret", {
      expiresIn: "730h",
    });

    const hardwareData = {
      client_id,
      client_secret,
      store_id,
      created_at: new Date().toISOString(),
    };

    const docRef = await firestore.collection("hardware").add(hardwareData);
    res.json({ message: "Data added successfully", data: hardwareData });
  } catch (error) {
    res.status(500).json({
      error: "Error adding data to Firestore",
      details: error.message,
    });
  }
});

app.post("/api/distance-matrix", async (req, res) => {
  const { origins, destinations } = req.body;

  const url = "https://api.openrouteservice.org/v2/matrix/driving-car";

  const data = {
    locations: [...origins, ...destinations],
    metrics: ["distance", "duration"],
    sources: [0],
    destinations: [1],
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from ORS:", error.message);
    res.status(500).json({ error: "Failed to fetch data from ORS." });
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
