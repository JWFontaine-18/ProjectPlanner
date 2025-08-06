import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWnsx2bRkYNDJKYRbY2uwuz3Cdt1JWeiI",
  authDomain: "tasktracker-c9a80.firebaseapp.com",
  projectId: "tasktracker-c9a80",
  storageBucket: "tasktracker-c9a80.firebasestorage.app",
  messagingSenderId: "908532115036",
  appId: "1:908532115036:web:0d4a26362edf81714aa899",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const signUp = document.getElementById("signupBtn");
signUp.addEventListener("click", function (e) {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;
  e.preventDefault();
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      window.location.href = "Home.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("failed");
    });
});
