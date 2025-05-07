// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAi8AkTGTHApco_TuSJEfOacL0JAQbs5U",
  authDomain: "orgweaver-9ebf7.firebaseapp.com",
  projectId: "orgweaver-9ebf7",
  storageBucket: "orgweaver-9ebf7.firebasestorage.app",
  messagingSenderId: "306295182969",
  appId: "1:306295182969:web:bb2d823f28c91fa16726a8",
  measurementId: "G-3E1P6F40K8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let auth = null
try {
  auth = await getAuth(app);
} catch(e) {
  console.log(e)
}


export {app, auth};