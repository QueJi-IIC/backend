const firebase = require("firebase-admin");
const serviceAccount = require("/etc/secrets/queji-firebase.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const firestore = firebase.firestore();

module.exports = { firebase, firestore };
