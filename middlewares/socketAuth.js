const firebase = require("../utils/firebase-admin");

const verifySocketToken = async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const decodedToken = await firebase.auth().verifyIdToken(token);
    socket.user = decodedToken;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};

module.exports = verifySocketToken;
