import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
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
  query,
  orderBy,
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
const loginForm = document.getElementById("loginForm");
const signUpBtn = document.getElementById("signUp");
const forgotPasswordBtn = document.getElementById("forgotPassword");
const signOutBtn = document.getElementById("signOut"); // added

// Authentication Functions
async function handleLogin(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // No manual redirect here; the auth state observer below will handle it.
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    alert("Login failed. Please check your credentials.");
  }
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

function handleForgotPassword(email) {
  return sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset email sent!");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

async function handleSignOut() {
  try {
    await signOut(auth);
    // No manual redirect; the non-login observer below handles it.
  } catch (error) {
    console.error("Sign out error:", error.code, error.message);
    alert("Sign out failed. Please try again.");
  }
}

// Event Listeners (guarded)
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    if (email && password) handleLogin(email, password);
    else alert("Please enter both email and password.");
  });
}

if (signUpBtn) {
  signUpBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    if (email && password) handleSignUp(email, password);
    else alert("Please enter both email and password.");
  });
}

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    if (email) handleForgotPassword(email);
    else alert("Please enter your email");
  });
}

// Redirect authenticated users away from the login page (and after successful login)
if (loginForm) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Use replace so the back button doesn't return to the login page
      window.location.replace("Home.html");
    }
  });
}

// Protect non-login pages (e.g., Home.html). Redirect to your login page when signed out.
if (!loginForm) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.replace("index.html"); // change to your actual login page if different
    }
  });
}

// Sign out button handler (only runs on pages that have the button)
if (signOutBtn) {
  signOutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleSignOut();
  });
}

// Firestore data
async function addTask(text) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add tasks.");
    return;
  }
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

// Subscribe to a user's tasks in real-time
function subscribeToTasks(callback) {
  const attach = (user) => {
    const q = query(
      collection(db, `users/${user.uid}/tasks`),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(tasks);
    });
  };

  if (auth.currentUser) {
    return attach(auth.currentUser);
  }
  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      const unsubTasks = attach(user);
      // stop listening to auth changes once tasks stream is attached
      unsubAuth();
      // Note: if you need to unsubscribe from tasks later, call unsubTasks where you stored it.
    }
  });
  return () => {
    unsubAuth && unsubAuth();
  };
}

// Update a single task
async function updateTask(taskId, updates) {
  const user = auth.currentUser;
  if (!user) return;
  await updateDoc(doc(db, `users/${user.uid}/tasks/${taskId}`), updates);
}

// Delete a single task
async function deleteTask(taskId) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, `users/${user.uid}/tasks/${taskId}`));
}

// Export for use in other modules
export {
  auth,
  db,
  addTask,
  handleSignOut,
  subscribeToTasks,
  updateTask,
  deleteTask,
};
