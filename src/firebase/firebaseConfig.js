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
      apiKey: "AIzaSyBCbL09h3WqzEVECEma5sIfmsWS8dxBfZ4",
      authDomain: "vibetribe-37c9b.firebaseapp.com",
      projectId: "vibetribe-37c9b",
      storageBucket: "vibetribe-37c9b.firebasestorage.app",
      messagingSenderId: "127059430677",
      appId: "1:127059430677:web:e81b6d721f17b8d6b06d1c"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
