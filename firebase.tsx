// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

// Your web app's Firebase configuration


// Initialize Firebase
const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();

export { db, auth, provider, signInWithPopup }