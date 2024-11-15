const { Socket } = require("socket.io");
const { firestore } = require("./utils/firebase-admin");

/**
 * @param {Socket} socket
 */
const socketHandler = (socket) => {
  console.log("A user connected via the", socket.platform);
  socket.on("detection_status", async (event) => {
    try {
      const statusData = {
        status: event.detected,
        timestamp: new Date().toISOString(),
      };
      console.log(statusData);
      await firestore.collection("status").doc(socket.store_id).set(statusData, { merge: true });
      console.log("Status updated in Firestore:", statusData);
    } catch (error) {
      console.error("Error updating status in Firestore:", error);
    }
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};

module.exports = socketHandler;