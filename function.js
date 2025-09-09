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
  dueDate: document.getElementById("dueDate"),
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
    const dueDate = dom.dueDate.value.trim();
    if (!taskText || !dueDate) {
      alert("Please enter a task!");
      return;
    }

    await firebaseAddTask(taskText, dueDate);
    dom.input.value = "";
    dom.dueDate.value = "";
  }

  _buildCheckbox(task, onToggle) {
    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "flex items-center";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer";

    checkbox.addEventListener("change", () => onToggle(checkbox.checked));

    checkboxContainer.appendChild(checkbox);
    return checkboxContainer;
  }

  _buildText(task) {
    const textContainer = document.createElement("div");
    textContainer.className = "flex-1 flex flex-col items-start";

    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = task.completed
      ? "text-gray-500 line-through font-medium"
      : "text-gray-900 font-medium";

    textContainer.appendChild(span);

    if (task.dueDate) {
      const due = document.createElement("span");
      due.textContent = `Due: ${task.dueDate}`;
      due.className = "text-sm text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block";
      textContainer.appendChild(due);
    }

    return { textContainer, span };
  }

  _buildDeleteButton(task) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className =
      "px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 font-medium shadow-sm";

    deleteBtn.addEventListener("click", () => {
      firebaseDeleteTask(task.id);
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.renderTasks();
    });

    return deleteBtn;
  }

  createListItem(task) {
    const li = document.createElement("li");
    li.className = "px-6 py-4 hover:bg-gray-50 transition-colors duration-150";

    const row = document.createElement("div");
    row.className = "flex items-center justify-between w-full gap-4";

    const { textContainer, span } = this._buildText(task);
    const checkboxContainer = this._buildCheckbox(task, (checked) => {
      firebaseUpdateTask(task.id, { completed: checked });
      const local = this.tasks.find((t) => t.id === task.id);
      if (local) local.completed = checked;

      // Reflect style instantly
      span.className = checked ? "text-gray-500 line-through" : "text-gray-900";

      this.renderTasks();
    });
    const deleteBtn = this._buildDeleteButton(task);

    row.appendChild(checkboxContainer);
    row.appendChild(textContainer);
    row.appendChild(deleteBtn);
    li.appendChild(row);

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

// Single onload initializer (removed duplicate definition)
window.onload = () => {
  window.taskManager = new TaskManager();
};
