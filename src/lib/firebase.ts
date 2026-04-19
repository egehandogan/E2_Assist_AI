import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlWPIKw5lOfOisJJHl_d8AOMlRXcpv0zA",
  authDomain: "e2assist.firebaseapp.com",
  projectId: "e2assist",
  storageBucket: "e2assist.firebasestorage.app",
  messagingSenderId: "734499137826",
  appId: "1:734499137826:web:69af4bfad04a0c99109d7b",
  measurementId: "G-SJ7L22VKH1"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
// We add google api scopes here to fetch tokens so our backend can act on user's behalf
// for Gmail, Calendar and Drive
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/drive");

export { app, auth, googleProvider };
