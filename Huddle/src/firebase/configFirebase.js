// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAylCJcNWapIpC67coKxvLgn5XgWZmJ_D4",
  authDomain: "huddle-ba2b4.firebaseapp.com",
  projectId: "huddle-ba2b4",
  storageBucket: "huddle-ba2b4.firebasestorage.app",
  messagingSenderId: "656812441125",
  appId: "1:656812441125:web:22642f1de4a89b1d2cc9cc",
  measurementId: "G-E6EX95QRZ0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
