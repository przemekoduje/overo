// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSl6C0GNhbZdQ1rsZN8sAKbMnoJp94e9E",
  authDomain: "overo-49285.firebaseapp.com",
  projectId: "overo-49285",
  storageBucket: "overo-49285.firebasestorage.app",
  messagingSenderId: "1033474475253",
  appId: "1:1033474475253:web:4fb2b919a684ca9826b1bc",
  measurementId: "G-D6MRSB3HDW"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);