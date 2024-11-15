const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAQhXBwh5O7D-my5LGoJRmlh2FGKpbXfa8",
  authDomain: "iic-queji.firebaseapp.com",
  projectId: "iic-queji",
  storageBucket: "iic-queji.firebasestorage.app",
  messagingSenderId: "624508744241",
  appId: "1:624508744241:web:e1c098fafd3c956d479b10",
  measurementId: "G-TTQQRPTMPJ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

module.exports = { auth, firestore };
