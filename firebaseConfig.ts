// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrvBFPQ3PlO9w0Sa47cW6zABFzp_qZyj8",
  authDomain: "jabbarkhan-portfolio.firebaseapp.com",
  projectId: "jabbarkhan-portfolio",
  storageBucket: "jabbarkhan-portfolio.firebasestorage.app",
  messagingSenderId: "1034314694186",
  appId: "1:1034314694186:web:acc3aa38421a7ee133cd53",
  measurementId: "G-3X1SX73Y5V"
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
import { getAuth, initializeAuth, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Initialize Auth with in-memory persistence (no auto-login)
export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence
});
export const db = getFirestore(app);

export default app;