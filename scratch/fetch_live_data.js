import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function run() {
  console.log("Fetching live poems...");
  const poemsSnap = await get(ref(db, "poems"));
  if (poemsSnap.exists()) {
    const poems = poemsSnap.val();
    console.log("Number of poems:", Object.keys(poems).length);
    // Write 5 sample poems to console
    const keys = Object.keys(poems).slice(0, 5);
    console.log("Sample poems:");
    keys.forEach(k => {
      console.log(`Key: ${k}`);
      console.log(`Title: ${poems[k].title}`);
      console.log(`Classification: ${poems[k].classification}`);
      console.log(`Theme: ${poems[k].theme}`);
      console.log(`Tags:`, poems[k].tags);
      console.log("-------------------");
    });
  }

  console.log("Fetching live quotes...");
  const quotesSnap = await get(ref(db, "quotes"));
  if (quotesSnap.exists()) {
    const quotes = quotesSnap.val();
    console.log("Number of quotes:", Object.keys(quotes).length);
    const keys = Object.keys(quotes).slice(0, 5);
    console.log("Sample quotes:");
    keys.forEach(k => {
      console.log(`Key: ${k}`);
      console.log(`Title: ${quotes[k].title}`);
      console.log(`Classification: ${quotes[k].classification}`);
      console.log(`Tags:`, quotes[k].tags);
      console.log("-------------------");
    });
  }
  process.exit(0);
}

run().catch(console.error);
