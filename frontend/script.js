function fetchTasks() {
  fetch("/tasks")
    .then((res) => res.json())
    .then((tasks) => {
      let list = document.getElementById("taskList");
      list.innerHTML = "";
      tasks.forEach((task) => {
        list.innerHTML += `
                <li>
                  ${task.title} 
                  <button onclick="deleteTask(${task.id})">Delete</button>
                </li>
            `;
      });
    });
}

function addTask() {
  let title = document.getElementById("taskInput").value;
  fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  }).then(() => fetchTasks());
}

function deleteTask(id) {
  fetch(`/tasks/${id}`, {
    method: "DELETE",
  }).then(() => fetchTasks());
}

fetchTasks();
