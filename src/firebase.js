// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDb_dQfa5uEBTOGsgoB1P0MS-gSNrjvdhg",
  authDomain: "security-camera-console.firebaseapp.com",
  projectId: "security-camera-console",
  storageBucket: "security-camera-console.firebasestorage.app",
  messagingSenderId: "34439503346",
  appId: "1:34439503346:web:cf1934769cb19132025f6b",
  measurementId: "G-NBYZLJ4V10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
export default app;