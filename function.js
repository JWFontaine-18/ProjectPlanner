class TaskManager {

  constructor() {
    this.tasks = [];
    this.init();
  }

  init() {
    this.loadTasksFromStorage();
    this.setupEventListeners();
  }

   setupEventListeners() {
    // Add task button
    document.getElementById("add-task").addEventListener('click', () => {
      this.addTask();
    });

    // Enter key on input
    document.getElementById("userInput").addEventListener('keypress', (event) => {
      if (event.key === "Enter") {
        this.addTask();
      }
    });

    // Remove all tasks button
    document.getElementById("remove").addEventListener('click', () => {
      this.removeAllTasks();
    });

    // Filter buttons
    document.getElementById("all").addEventListener('click', () => {
      this.showAll();
    });

    document.getElementById("completed").addEventListener('click', () => {
      this.showCompletedTask();
    });
  }

  loadTasksFromStorage() {
  const storedData = localStorage.getItem("tasks");
  try {
    if (storedData && storedData !== "undefined") {
      this.tasks = JSON.parse(storedData);
      for (let task of this.tasks) {
        this.createListItem(task);
      }
    }
  } catch (error) {
    console.error("Error parsing tasks from storage:", error);
    this.tasks = []; // reset if bad data
    localStorage.removeItem("tasks");
  }
}


  addTask() {
      const text = document.getElementById("userInput").value.trim();
      if (!text) return; // prevent blanks

      const newTask = { text: text, completed: false };
      this.tasks.push(newTask);
      localStorage.setItem("tasks", JSON.stringify(this.tasks));

      this.createListItem(newTask); // use your function!

      document.getElementById("userInput").value = "";
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
    task.completed = checkbox.checked; // update the task
    span.style.textDecoration = checkbox.checked ? "line-through" : "none"; // strike or unstrike
    localStorage.setItem("tasks", JSON.stringify(this.tasks)); // save
    li.remove();
    if (checkbox.checked) {
      document.getElementById("completedTask").appendChild(li);
    } else document.getElementById("List").appendChild(li);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  deleteBtn.onclick = () => {
    li.remove();
    this.tasks = this.tasks.filter((t) => t !== task);
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
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
  // 1. Clear the list visually
  document.getElementById("List").innerHTML = "";
  document.getElementById("completedTask").innerHTML = "";

  // 2. Clear the array
  this.tasks = [];

  // 3. Clear localStorage
  localStorage.removeItem("tasks");
}

showAll() {
  const list = document.getElementById("List");
  const list1 = document.getElementById("completedTask");
  list.innerHTML = "";
  list1.innerHTML = "";
  this.tasks.forEach((task) => {
    this.createListItem(task);
  });
}

showCompletedTask() {
  const list = document.getElementById("List");
  const list1 = document.getElementById("completedTask");

  list.innerHTML = "";
  list1.innerHTML = "";

  this.tasks.forEach((task) => {
    if (task.completed) {
      this.createListItem(task);
    }
  });
}


};

window.onload = function () {
  window.taskManager = new TaskManager();
};