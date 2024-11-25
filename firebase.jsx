import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBQJn9aqgX0rejysoYFlA4F9V6uMEn-Xr8",
  authDomain: "rn-voicerecorder.firebaseapp.com",
  projectId: "rn-voicerecorder",
  storageBucket: "rn-voicerecorder.firebasestorage.app",
  messagingSenderId: "1056140167666",
  appId: "1:1056140167666:web:d36f02c7fb18b337cd436b",
  measurementId: "G-SQZMSR7BRR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app)

export { auth, db, storage };
