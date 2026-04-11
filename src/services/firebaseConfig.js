// src/services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your actual Firebase Project keys
// You can get these from the Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyCzuuiljTKHYrMw6VEMFlZ4YcefoPvZOuA",
  authDomain: "agripulse-7fee6.firebaseapp.com",
  projectId: "agripulse-7fee6",
  storageBucket: "agripulse-7fee6.firebasestorage.app",
  messagingSenderId: "893221034422",
  appId: "1:893221034422:web:578ff1827b0e9a54df8917",
  measurementId: "G-2ESLFW07GL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
