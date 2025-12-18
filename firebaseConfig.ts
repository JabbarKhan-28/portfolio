import { initializeApp } from "firebase/app";
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCuYF8zL_9PXdaN2oXk-v5vrGxdcLWlATY",
  authDomain: "baro-portfolio.firebaseapp.com",
  projectId: "baro-portfolio",
  storageBucket: "baro-portfolio.firebasestorage.app",
  messagingSenderId: "602533365802",
  appId: "1:602533365802:web:675b9823eec33db8501b53",
  measurementId: "G-T83ND09QJM"
};

const app = initializeApp(firebaseConfig);

// Use in-memory persistence to ensure user is logged out by default
// This requires the user to login via the secret key flow every time they restart the app.
const auth = initializeAuth(app, {
  persistence: inMemoryPersistence
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

