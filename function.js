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
    // <li> row shell
    const li = document.createElement("li");
    li.className = "px-4 py-5 sm:px-6 hover:bg-gray-50";

    // Row: [checkbox | centered text | delete]
    const row = document.createElement("div");
    row.className = "flex items-center justify-between w-full";

    // Left: checkbox
    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "flex items-center";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "scale-110 cursor-pointer";
    checkboxContainer.appendChild(checkbox);

    // Center: text (fills remaining space and centers)
    const textContainer = document.createElement("div");
    textContainer.className = "flex-1 flex justify-center";
    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = task.completed
      ? "text-gray-500 line-through"
      : "text-gray-900";
    textContainer.appendChild(span);

    // Right: delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className =
      "px-2.5 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700";

    // Assemble row
    row.appendChild(checkboxContainer);
    row.appendChild(textContainer);
    row.appendChild(deleteBtn);
    li.appendChild(row);

    // Events (unchanged logic)
    checkbox.addEventListener("change", () => {
      firebaseUpdateTask(task.id, { completed: checkbox.checked });
      const local = this.tasks.find((t) => t.id === task.id);
      if (local) local.completed = checkbox.checked;

      // Reflect style instantly
      span.className = checkbox.checked
        ? "text-gray-500 line-through"
        : "text-gray-900";
      this.renderTasks();
    });

    deleteBtn.addEventListener("click", () => {
      firebaseDeleteTask(task.id);
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.renderTasks();
    });

    // Append to appropriate list
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

window.onload = function () {
  window.taskManager = new TaskManager();
};
