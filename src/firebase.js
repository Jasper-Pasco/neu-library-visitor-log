import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQtzWl--mRNs4cC44nRB2cEcmthhOtVjU",
  authDomain: "neu-library-visitor-log-51899.firebaseapp.com",
  projectId: "neu-library-visitor-log-51899",
  storageBucket: "neu-library-visitor-log-51899.firebasestorage.app",
  messagingSenderId: "793238387199",
  appId: "1:793238387199:web:7168a92fae9656574dcfca"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);