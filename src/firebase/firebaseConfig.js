// firebase/firebaseConfig.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// These variables are provided by the Canvas environment.
// If running outside Canvas, replace with your actual Firebase config.
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
    apiKey: "AIzaSyCBH0a8kM3Z7h6IxxyhV7ddT8J_EVy_Ju8",
    authDomain: "vibe-f65d9.firebaseapp.com",
    projectId: "vibe-f65d9",
    storageBucket: "vibe-f65d9.firebasestorage.app",
    messagingSenderId: "1019930103489",
    appId: "1:1019930103489:web:5da52c3ede9ecd644d8e40",

  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
