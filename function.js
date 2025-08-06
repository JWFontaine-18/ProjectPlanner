let tasks = [];

function createListItem(task) {
  var li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = task.text;
  if (task.completed) {
    span.style.textDecoration = "line-through";
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  checkbox.onchange = function () {
    task.completed = checkbox.checked; // update the task
    span.style.textDecoration = checkbox.checked ? "line-through" : "none"; // strike or unstrike
    localStorage.setItem("tasks", JSON.stringify(tasks)); // save
    li.remove();
    if (checkbox.checked) {
      document.getElementById("completedTask").appendChild(li);
    } else document.getElementById("List").appendChild(li);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  deleteBtn.onclick = function () {
    li.remove();
    tasks = tasks.filter((t) => t !== task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
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

function removeTask() {
  // 1. Clear the list visually
  document.getElementById("List").innerHTML = "";

  // 2. Clear the array
  tasks = [];

  // 3. Clear localStorage
  localStorage.removeItem("tasks");
}

window.onload = function () {
  const storedData = localStorage.getItem("tasks");
  if (storedData) {
    tasks = JSON.parse(storedData);
    for (let t of tasks) {
      createListItem(t);
    }
  }
};

function addTask() {
  const text = document.getElementById("userInput").value.trim();
  if (!text) return; // prevent blanks

  const newTask = { text: text, completed: false };
  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  createListItem(newTask); // use your function!

  document.getElementById("userInput").value = "";
}

document.getElementById("add-task").onclick = addTask;

document
  .getElementById("userInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addTask();
    }
  });

function showAll() {
  const list = document.getElementById("List");
  const list1 = document.getElementById("completedTask");
  list.innerHTML = "";
  list1.innerHTML = "";
  tasks.forEach((task) => {
    createListItem(task);
  });
}

document.getElementById("all").addEventListener("click", showAll);

function showCompletedTask() {
  const list = document.getElementById("List");
  const list1 = document.getElementById("completedTask");

  list.innerHTML = "";
  list1.innerHTML = "";

  tasks.forEach((task) => {
    if (task.completed) {
      createListItem(task);
    }
  });
}

document
  .getElementById("completed")
  .addEventListener("click", showCompletedTask);
