const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBksV_Yg-cVe26GJp9SIiNTE5wXqxibkwg",
  authDomain: "jabbarkhan-portfolio-99a86.firebaseapp.com",
  projectId: "jabbarkhan-portfolio-99a86",
  storageBucket: "jabbarkhan-portfolio-99a86.firebasestorage.app",
  messagingSenderId: "138876023008",
  appId: "1:138876023008:web:3317c510a1da23e47be085",
  measurementId: "G-6DFEHGK88D"
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
