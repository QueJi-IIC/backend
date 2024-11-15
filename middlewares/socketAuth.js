const { firestore } = require("../utils/firebase-admin");
const jwt = require("jsonwebtoken");

const verifySocketToken = async (socket, next) => {
  const clientId = socket.handshake.headers["client-id"];
  const clientSecret = socket.handshake.headers["client-secret"];
  const deviceType = socket.handshake.headers["platform"];

  if (!deviceType) {
    return next(new Error("Device Type is needed"));
  }

  if (deviceType === "web") {
    socket.store_id = "web";
    socket.deviceType = deviceType;
    next();
  }

  if (deviceType === "hardware") {
    if (!clientId || !clientSecret) {
      return next(new Error("Parameters are needed"));
    }

    try {
      // Verify the client secret
      const decoded = jwt.verify(clientSecret, "your_jwt_secret");
      if (decoded.client_id !== clientId) {
        throw new Error("Invalid Client Secret");
      }

      // Retrieve the store_id from the hardware collection
      const hardwareQuerySnapshot = await firestore
        .collection("hardware")
        .where("client_id", "==", clientId)
        .get();
      if (hardwareQuerySnapshot.empty) {
        throw new Error("No hardware found for the provided ClientID");
      }

      const hardwareDoc = hardwareQuerySnapshot.docs[0];
      const store_id = hardwareDoc.data().store_id;

      // Attach the store_id to the socket object
      socket.store_id = store_id;
      socket.deviceType = deviceType;
      next();
    } catch (error) {
      next(new Error("Unauthorized: " + error.message));
    }
  }
};

module.exports = verifySocketToken;
