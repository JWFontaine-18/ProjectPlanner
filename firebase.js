import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase Configuration
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
const db = getFirestore(app);

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const signUpBtn = document.getElementById("signUp");

// Authentication Functions
function handleLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Login successful!");
      window.location.href = "Home.html";
    })
    .catch((error) => {
      console.error("Login error:", error.code, error.message);
      alert("Login failed. Please check your credentials.");
    });
}

function handleSignUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Account created successfully!");
      window.location.href = "Home.html";
    })
    .catch((error) => {
      console.error("Sign up error:", error.code, error.message);
      alert("Sign up failed. Please try again.");
    });
}

// Event Listeners
loginBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  if (email && password) {
    handleLogin(email, password);
  } else {
    alert("Please enter both email and password.");
  }
});

signUpBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const email = document.getElementById("newEmail").value;
  const password = document.getElementById("newPassword").value;

  if (email && password) {
    handleSignUp(email, password);
  } else {
    alert("Please enter both email and password.");
  }
});

// Firestore data
async function addTask(text) {
  const user = auth.currentUser;
  if (!user) return; // safety

  try {
    await addDoc(collection(db, `users/${user.uid}/tasks`), {
      text: text,
      completed: false,
      createdAt: serverTimestamp(),
    });
    alert("Success");
  } catch (e) {
    console.error("❌ Error adding task:", e);
    alert("failed");
  }
}
// Export for use in other modules
export { auth, db, addTask };
