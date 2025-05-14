// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "prenotazioni-teatro-ff3ed.firebaseapp.com",
  projectId: "prenotazioni-teatro-ff3ed",
  storageBucket: "prenotazioni-teatro-ff3ed.firebasestorage.app",
  messagingSenderId: "683372109808",
  appId: "1:683372109808:web:6bef25d0034fe8a9128735"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
