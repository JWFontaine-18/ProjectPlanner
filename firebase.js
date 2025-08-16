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

// ==========================================================
// Firebase configuration and initialization
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyCWnsx2bRkYNDJKYRbY2uwuz3Cdt1JWeiI",
  authDomain: "tasktracker-c9a80.firebaseapp.com",
  projectId: "tasktracker-c9a80",
  storageBucket: "tasktracker-c9a80.firebasestorage.app",
  messagingSenderId: "908532115036",
  appId: "1:908532115036:web:0d4a26362edf81714aa899",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================================
// DOM elements (guarded usage in listeners below)
// ==========================================================
const loginForm = document.getElementById("loginForm");
const signUpForm = document.getElementById("signUpForm");
const forgotPasswordBtn = document.getElementById("forgotPassword");
const signOutBtn = document.getElementById("signOut");

// ==========================================================
// Authentication actions
// ==========================================================
async function handleLogin(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect handled by auth state observer on login page.
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    alert("Login failed. Please check your credentials.");
  }
}

function handleSignUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Keep manual redirect to maintain current behavior.
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
      console.error("Password reset error:", error.code, error.message);
    });
}

async function handleSignOut() {
  try {
    await signOut(auth);
    // Redirect handled by non-login guard below.
  } catch (error) {
    console.error("Sign out error:", error.code, error.message);
    alert("Sign out failed. Please try again.");
  }
}

// ==========================================================
// Event listeners (guarded by element presence)
// ==========================================================
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    if (email && password) {
      handleLogin(email, password);
    } else {
      alert("Please enter both email and password.");
    }
  });
}

if (signUpForm) {
  signUpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    if (email && password) {
      handleSignUp(email, password);
    } else {
      alert("Please enter both email and password.");
    }
  });
}

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    if (email) {
      handleForgotPassword(email);
    } else {
      alert("Please enter your email");
    }
  });
}

if (signOutBtn) {
  signOutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleSignOut();
  });
}

// ==========================================================
// Auth state route guards
// ==========================================================
// On login page, redirect authenticated users to Home.html.
if (loginForm) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.replace("Home.html");
    }
  });
}

// On non-login pages, redirect signed-out users back to index.html.
if (!loginForm) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.replace("index.html");
    }
  });
}

// ==========================================================
// Firestore: task helpers
// ==========================================================
// Add a task for the current user.
async function addTask(text, dueDate) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add tasks.");
    return;
  }
  try {
    await addDoc(collection(db, `users/${user.uid}/tasks`), {
      text,
      completed: false,
      dueDate: dueDate, 
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding task:", e);
    alert("failed");
  }
}

// Subscribe to a user's tasks in real-time; returns an unsubscribe function.
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

  // If auth state not ready yet, wait and then attach.
  let unsubTasks = null;
  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (user && !unsubTasks) {
      unsubTasks = attach(user);
    }
  });

  // Ensure caller can unsubscribe both listeners.
  return () => {
    if (unsubTasks) unsubTasks();
    unsubAuth();
  };
}

// Update a single task by id.
async function updateTask(taskId, updates) {
  const user = auth.currentUser;
  if (!user) return;
  await updateDoc(doc(db, `users/${user.uid}/tasks/${taskId}`), updates);
}

// Delete a single task by id.
async function deleteTask(taskId) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, `users/${user.uid}/tasks/${taskId}`));
}

// ==========================================================
// Exports
// ==========================================================
export {
  auth,
  db,
  addTask,
  handleSignOut,
  subscribeToTasks,
  updateTask,
  deleteTask,
};
