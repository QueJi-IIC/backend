const { firebase } = require("../utils/firebase-admin");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await firebase.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = verifyToken;
