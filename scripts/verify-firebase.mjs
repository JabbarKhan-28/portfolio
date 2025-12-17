import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuYF8zL_9PXdaN2oXk-v5vrGxdcLWlATY",
  authDomain: "baro-portfolio.firebaseapp.com",
  projectId: "baro-portfolio",
  storageBucket: "baro-portfolio.firebasestorage.app",
  messagingSenderId: "602533365802",
  appId: "1:602533365802:web:675b9823eec33db8501b53",
  measurementId: "G-T83ND09QJM"
};

async function testFirebase() {
  console.log("Initializing Firebase...");
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log("Firebase initialized.");

    console.log("Testing Firestore Write...");
    const testCol = collection(db, "connection_test");
    const docRef = await addDoc(testCol, {
      timestamp: new Date().toISOString(),
      test: true
    });
    console.log("Write successful! Doc ID:", docRef.id);

    console.log("Testing Firestore Read...");
    const snapshot = await getDocs(testCol);
    console.log(`Read successful! Found ${snapshot.size} docs.`);

    console.log("Cleaning up...");
    await deleteDoc(doc(db, "connection_test", docRef.id));
    console.log("Delete successful!");

    console.log("✅ Firebase is working correctly.");
  } catch (error) {
    console.error("❌ Firebase Error:", error.message);
    if (error.code) console.error("Error Code:", error.code);
  }
}

testFirebase();
