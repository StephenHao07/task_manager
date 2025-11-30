let tasksCache = [];
let filteredTasks = [];
let currentView = "active";

async function fetchTasks() {
  try {
    const res = await fetch(`/tasks?view=${currentView}`);
    const tasks = await res.json();
    tasksCache = tasks || [];
    filteredTasks = [...tasksCache];
    filterTasks();
    updateToggleButton();
  } catch (err) {
    console.error("Failed to fetch tasks", err);
  }
}

function updateToggleButton() {
  const btn = document.getElementById("toggleViewBtn");
  if (currentView === "active") {
    btn.textContent = "View Archive 📁";
  } else {
    btn.textContent = "View Active 📋";
  }
}

function toggleView() {
  currentView = currentView === "active" ? "archive" : "active";
  fetchTasks();
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  const empty = document.getElementById("empty");
  list.innerHTML = "";

  if (!tasks || tasks.length === 0) {
    empty.style.display = "block";
    empty.textContent =
      currentView === "active"
        ? "No active tasks — add your first task."
        : "No archived tasks.";
    return;
  }
  empty.style.display = "none";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task priority-${task.priority || "medium"}`;

    // left area: checkbox + title + priority badge + due date + times
    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("div");
    checkbox.className = "checkbox" + (task.is_done ? " checked" : "");
    checkbox.title = task.is_done ? "Mark as not done" : "Mark as done";
    checkbox.setAttribute("role", "button");
    checkbox.addEventListener("click", () => toggleTask(task.id));

    const title = document.createElement("div");
    title.className = "task-title" + (task.is_done ? " done" : "");
    title.textContent = task.title;
    title.title = task.title;

    const priorityBadge = document.createElement("div");
    priorityBadge.className = `priority-badge priority-${task.priority}`;
    priorityBadge.textContent =
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    const dueDate = document.createElement("div");
    dueDate.className = "small due-date";
    if (task.due_date) {
      const today = new Date().toISOString().split("T")[0];
      const isOverdue = task.due_date < today && !task.is_done;
      dueDate.textContent = `Due: ${task.due_date}`;
      if (isOverdue) dueDate.classList.add("overdue");
    } else {
      dueDate.textContent = "No due date";
    }

    const created = document.createElement("div");
    created.className = "small";
    created.textContent = `Created: ${formatDate(task.created_at)}`;

    const completed = document.createElement("div");
    completed.className = "small";
    if (task.completed_at) {
      completed.textContent = `Completed: ${formatDate(task.completed_at)}`;
    }

    left.appendChild(checkbox);
    left.appendChild(title);
    left.appendChild(priorityBadge);
    left.appendChild(dueDate);
    left.appendChild(created);
    if (task.completed_at) left.appendChild(completed);

    // actions: toggle + delete
    const actions = document.createElement("div");
    actions.className = "actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "action-btn toggle";
    toggleBtn.textContent = task.is_done ? "Undo" : "Done";
    toggleBtn.addEventListener("click", () => toggleTask(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Permanently delete this task?")) deleteTask(task.id);
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("dueDateInput");
  const priorityInput = document.getElementById("priorityInput");
  const title = input.value.trim();
  if (!title) return;
  try {
    await fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        due_date: dueDateInput.value || null,
        priority: priorityInput.value,
      }),
    });
    input.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";
    await fetchTasks();
  } catch (err) {
    console.error("Failed to add task", err);
  }
}

async function toggleTask(id) {
  try {
    const task = tasksCache.find((t) => t.id === id);
    if (!task) return;
    const updated = {
      title: task.title,
      is_done: task.is_done ? 0 : 1,
      due_date: task.due_date,
      priority: task.priority,
    };
    await fetch(`/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    await fetchTasks();
  } catch (err) {
    console.error("Failed to toggle task", err);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`/tasks/${id}`, { method: "DELETE" });
    await fetchTasks();
  } catch (err) {
    console.error("Failed to delete task", err);
  }
}

function filterTasks() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const priorityFilter = document.getElementById("priorityFilter").value;
  filteredTasks = tasksCache.filter(
    (task) =>
      (priorityFilter === "all" || task.priority === priorityFilter) &&
      task.title.toLowerCase().includes(searchInput)
  );
  renderTasks(filteredTasks);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

fetchTasks();
