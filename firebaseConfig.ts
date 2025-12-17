import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';

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

let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

