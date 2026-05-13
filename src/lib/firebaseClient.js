import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCA__Mtb9oNy_NnglGfn3WDkb47dbbi8tI",
  authDomain: "elvanparthasarathy.firebaseapp.com",
  databaseURL: "https://elvanparthasarathy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "elvanparthasarathy",
  storageBucket: "elvanparthasarathy.firebasestorage.app",
  messagingSenderId: "388935758553",
  appId: "1:388935758553:web:9da2868cd8c03d937dc4c8",
  measurementId: "G-TYDPNQ7Z8S"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
