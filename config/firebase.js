// firebase.js أو firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBrMM25Zs75ReGN6mqs2Yeh5f9-GCkqfGY",
    authDomain: "coffee-shop-7a0cc.firebaseapp.com",
    projectId: "coffee-shop-7a0cc",
    storageBucket: "coffee-shop-7a0cc.firebasestorage.app",
    messagingSenderId: "683184825704",
    appId: "1:683184825704:web:3afc7d70168699179d22dd",
    measurementId: "G-TR6HJNCRWY"
};
// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
