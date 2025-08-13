import {
  addTask as firebaseAddTask,
  subscribeToTasks,
  updateTask as firebaseUpdateTask,
  deleteTask as firebaseDeleteTask,
} from "./firebase.js";

class TaskManager {
  constructor() {
    this.tasks = [];
    this.filter = "all";
    this.unsubscribe = null;
    this.init();
  }

  init() {
    // this.loadTasksFromStorage();
    this.setupEventListeners();

    // Subscribe to user's tasks in Firestore
    this.unsubscribe = subscribeToTasks((tasks) => {
      this.tasks = tasks;
      this.renderTasks();
    });
  }

  setupEventListeners() {
    // Add task button
    document.getElementById("add-task").addEventListener("click", () => {
      this.addTask();
    });

    // Enter key on input
    document
      .getElementById("userInput")
      .addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          this.addTask();
        }
      });

    // Remove all tasks button
    document.getElementById("remove").addEventListener("click", () => {
      this.removeAllTasks();
    });

    // Filter buttons
    document.getElementById("all").addEventListener("click", () => {
      this.showAll();
    });

    document.getElementById("completed").addEventListener("click", () => {
      this.showCompletedTask();
    });

    // Login button redirects to Home.html
  }

  // loadTasksFromStorage() {
  //   const storedData = localStorage.getItem("tasks");
  //   try {
  //     if (storedData && storedData !== "undefined") {
  //       this.tasks = JSON.parse(storedData);
  //       for (let task of this.tasks) {
  //         this.createListItem(task);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error parsing tasks from storage:", error);
  //     this.tasks = []; // reset if bad data
  //     localStorage.removeItem("tasks");
  //   }
  // }

  async addTask() {
    const input = document.getElementById("userInput");
    const taskText = input.value.trim();

    if (taskText === "") {
      alert("Please enter a task!");
      return;
    }

    // Add to Firebase
    await firebaseAddTask(taskText);

    // Clear input
    input.value = "";
  }

  createListItem(task) {
    var li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.completed) {
      span.style.textDecoration = "line-through";
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.onchange = () => {
      // Update Firestore and optimistically update UI
      firebaseUpdateTask(task.id, { completed: checkbox.checked });
      const local = this.tasks.find((t) => t.id === task.id);
      if (local) local.completed = checkbox.checked;
      this.renderTasks();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      firebaseDeleteTask(task.id);
      // Optimistically update UI
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.renderTasks();
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    if (!task.completed) {
      document.getElementById("List").appendChild(li);
    } else {
      document.getElementById("completedTask").appendChild(li);
    }
  }

  removeAllTasks() {
    // Delete all tasks from Firestore
    Promise.all(this.tasks.map((t) => firebaseDeleteTask(t.id)));
  }

  showAll() {
    this.filter = "all";
    this.renderTasks();
  }

  showCompletedTask() {
    this.filter = "completed";
    this.renderTasks();
  }

  renderTasks() {
    const list = document.getElementById("List");
    const completedList = document.getElementById("completedTask");
    list.innerHTML = "";
    completedList.innerHTML = "";

    const tasksToShow =
      this.filter === "completed"
        ? this.tasks.filter((t) => t.completed)
        : this.tasks;

    tasksToShow.forEach((task) => this.createListItem(task));
  }

  printTasks() {
    console.log("All Tasks:", this.tasks);
  }
}

window.onload = function () {
  window.taskManager = new TaskManager();
};
