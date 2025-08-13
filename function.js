import {
  addTask as firebaseAddTask,
  subscribeToTasks,
  updateTask as firebaseUpdateTask,
  deleteTask as firebaseDeleteTask,
} from "./firebase.js";

// Cache DOM references once for clarity and performance
const dom = {
  input: document.getElementById("userInput"),
  addBtn: document.getElementById("add-task"),
  removeAllBtn: document.getElementById("remove"),
  list: document.getElementById("List"),
  completedList: document.getElementById("completedTask"),
  filterAllBtn: document.getElementById("all"),
  filterCompletedBtn: document.getElementById("completed"),
};

class TaskManager {
  constructor() {
    this.tasks = [];
    this.filter = "all"; // "all" | "completed"
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.setupEventListeners();

    // Subscribe to user's tasks in Firestore
    this.unsubscribe = subscribeToTasks((tasks) => {
      this.tasks = tasks;
      this.renderTasks();
    });
  }

  setupEventListeners() {
    // Add task on button click
    dom.addBtn.addEventListener("click", () => this.addTask());

    // Add task on Enter key in input
    dom.input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") this.addTask();
    });

    // Remove all tasks button
    dom.removeAllBtn.addEventListener("click", () => this.removeAllTasks());

    // Filters
    dom.filterAllBtn.addEventListener("click", () => this.showAll());
    dom.filterCompletedBtn.addEventListener("click", () =>
      this.showCompletedTasks()
    );
  }

  async addTask() {
    const taskText = dom.input.value.trim();
    if (!taskText) {
      alert("Please enter a task!");
      return;
    }

    await firebaseAddTask(taskText);
    dom.input.value = "";
  }

  createListItem(task) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.completed) span.style.textDecoration = "line-through";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    // Toggle completion state
    checkbox.addEventListener("change", () => {
      firebaseUpdateTask(task.id, { completed: checkbox.checked });
      // Optimistic UI update mirrors Firestore value
      const local = this.tasks.find((t) => t.id === task.id);
      if (local) local.completed = checkbox.checked;
      this.renderTasks();
    });

    // Delete task
    deleteBtn.addEventListener("click", () => {
      firebaseDeleteTask(task.id);
      // Optimistic UI update
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // Append to appropriate list based on completion state
    if (!task.completed) {
      dom.list.appendChild(li);
    } else {
      dom.completedList.appendChild(li);
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

  showCompletedTasks() {
    this.filter = "completed";
    this.renderTasks();
  }

  renderTasks() {
    dom.list.innerHTML = "";
    dom.completedList.innerHTML = "";

    const tasksToShow =
      this.filter === "completed"
        ? this.tasks.filter((t) => t.completed)
        : this.tasks;

    tasksToShow.forEach((task) => this.createListItem(task));
  }
}

window.onload = () => {
  window.taskManager = new TaskManager();
};
const tasksToShow =
  this.filter === "completed"
    ? this.tasks.filter((t) => t.completed)
    : this.tasks;

tasksToShow.forEach((task) => this.createListItem(task));

window.onload = function () {
  window.taskManager = new TaskManager();
};
