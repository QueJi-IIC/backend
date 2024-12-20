const { Socket } = require("socket.io");
const { firestore, firebase } = require("../utils/firebase-admin");
const jwt = require("jsonwebtoken");

/**
 * @param {Socket} socket
 * @param {import("express").NextFunction} next
 */
const verifySocketToken = async (socket, next) => {
  const clientId = socket.handshake.headers["client-id"];
  const clientSecret = socket.handshake.headers["client-secret"];
  const platform = socket.handshake.headers["platform"];
  if (!platform) {
    return next(new Error("Device Type is needed"));
  }

  if (platform === "web") {
    socket.join("web");    
    // validate the firebase id token and store the user
    const idToken = socket.handshake.headers["authorization"];
    const role = socket.handshake.headers["role"];
    if (!idToken || !role) {
      return next(new Error("Please provide the token and role"));
    }
    try {
      const decodedToken = await firebase.auth().verifyIdToken(idToken);
      socket.user = decodedToken;
    } catch (error) {
      return next(new Error("Unauthorized: " + error.message));
    }
    socket.platform = platform;
    socket.role = role;
    next();
  } else if (platform === "hardware") {
    socket.join("hardware");
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
      socket.platform = platform;
      next();
    } catch (error) {
      next(new Error("Unauthorized: " + error.message));
    }
  } else {
    next();
  }
};

module.exports = verifySocketToken;