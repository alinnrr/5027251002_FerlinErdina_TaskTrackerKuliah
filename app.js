// 02. State di array of objects
let tasks = [];

// DOM Elements
const taskList = document.querySelector("#task-list");
const counter = document.querySelector("#counter");

const taskForm = document.querySelector("#task-form");
const judulInput = document.querySelector("#judul-input");
const matkulSelect = document.querySelector("#matkul-select");
const deadlineInput = document.querySelector("#deadline-input");
const errorMsg = document.querySelector("#error-msg");

// 01. Form Tambah Tugas + preventDefault & Validasi
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const judul = judulInput.value.trim();
  const matkul = matkulSelect.value;
  const deadline = deadlineInput.value;

  // Validasi
  if (judul.length < 3) {
    errorMsg.textContent = "Judul tugas minimal 3 karakter!";
    return;
  }
  if (!deadline) {
    errorMsg.textContent = "Deadline wajib diisi!";
    return;
  }

  errorMsg.textContent = ""; // Clear error jika valid

  const newTask = {
    id: Date.now(),
    judul: judul,
    matkul: matkul,
    deadline: deadline,
    selesai: false,
  };

  tasks.push(newTask);
  render();

  // Reset form
  judulInput.value = "";
  deadlineInput.value = "";
});

// 03. Event Delegation di <ul> untuk checkbox & hapus
taskList.addEventListener("click", (e) => {
  const item = e.target.closest(".task-item");
  if (!item) return;

  const id = Number(item.dataset.id);

  // Toggle Selesai
  if (e.target.classList.contains("task-checkbox")) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, selesai: e.target.checked } : task,
    );
    render();
  }

  // Tombol Hapus
  if (e.target.classList.contains("delete-btn")) {
    tasks = tasks.filter((task) => task.id !== id);
    render();
  }
});

// 02, 05, & 06. Fungsi Render Tunggal & Aman
function render() {
  taskList.innerHTML = "";

  // 05. Counter tugas aktif
  const activeCount = tasks.filter((t) => !t.selesai).length;
  counter.textContent = `${activeCount} tugas aktif`;

  if (tasks.length === 0) {
    taskList.innerHTML = `<li class="empty-msg">Tidak ada tugas.</li>`;
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.selesai ? "done" : ""}`;
    li.dataset.id = task.id;

    const infoDiv = document.createElement("div");
    infoDiv.className = "task-info";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.selesai;

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "task-details";

    // 06. Aman: menggunakan textContent untuk mencegah XSS
    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.judul;

    const metaSpan = document.createElement("span");
    metaSpan.className = "task-meta";
    metaSpan.textContent = `${task.matkul} · deadline ${task.deadline}`;

    detailsDiv.append(titleSpan, metaSpan);
    infoDiv.append(checkbox, detailsDiv);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";

    li.append(infoDiv, deleteBtn);
    taskList.append(li);
  });
}

render();
