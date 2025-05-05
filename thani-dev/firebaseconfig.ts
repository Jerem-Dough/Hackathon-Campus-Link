// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "API KEY",
  authDomain: "thani-b6211.firebaseapp.com",
  projectId: "thani-b6211",
  storageBucket: "thani-b6211.firebasestorage.app",
  messagingSenderId: "1001649875791",
  appId: "1:1001649875791:web:87483f98cffab4dd60733a",
  measurementId: "G-LYN5BETSV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);