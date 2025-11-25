import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE0d_ckg21_NRcFB4bAr_xICuhHjl5HI0", // Placeholder Key as requested
  authDomain: "astra-lakh-ea.firebaseapp.com",
  projectId: "astra-lakh-ea",
  storageBucket: "astra-lakh-ea.firebasestorage.app",
  messagingSenderId: "897475327816",
  appId: "1:897475327816:web:331ce40093ee418b6ca57d"
};

// Initialize Firebase services and export them
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();