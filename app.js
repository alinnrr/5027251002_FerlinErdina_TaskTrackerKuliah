// 02. State di Array of Objects (Penyimpanan Utama)
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "semua";

// DOM Elements
const taskForm = document.querySelector("#task-form");
const judulInput = document.querySelector("#judul-input");
const matkulSelect = document.querySelector("#matkul-select");
const deadlineInput = document.querySelector("#deadline-input");
const errorMsg = document.querySelector("#error-msg");
const taskList = document.querySelector("#task-list");
const counter = document.querySelector("#counter");
const filterButtons = document.querySelectorAll(".filter-btn");

// 01. Form Tambah Tugas dengan Validasi
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

  errorMsg.textContent = ""; // Bersihkan error jika valid

  // Tambah State Baru
  const newTask = {
    id: Date.now(),
    judul: judul,
    matkul: matkul,
    deadline: deadline,
    selesai: false,
  };

  tasks.push(newTask);
  saveAndRender();

  // Reset Input
  judulInput.value = "";
  deadlineInput.value = "";
});

// 03. Event Delegation pada <ul> (Checkbox Selesai & Hapus)
taskList.addEventListener("click", (e) => {
  const item = e.target.closest(".task-item");
  if (!item) return;

  const id = Number(item.dataset.id);

  // Jika Checkbox diklik
  if (e.target.classList.contains("task-checkbox")) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, selesai: e.target.checked } : task,
    );
    saveAndRender();
  }

  // Jika Tombol Hapus diklik
  if (e.target.classList.contains("delete-btn")) {
    tasks = tasks.filter((task) => task.id !== id);
    saveAndRender();
  }
});

// 04. Filter Filter (Semua / Aktif / Selesai)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Bonus: Simpan ke localStorage & Urutkan berdasarkan deadline terdekat
function saveAndRender() {
  tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
}

// 02 & 05 & 06. Fungsi Render Tunggal & Aman (textContent)
function render() {
  taskList.innerHTML = "";

  // Filter Data
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "aktif") return !task.selesai;
    if (currentFilter === "selesai") return task.selesai;
    return true; // semua
  });

  // 05. Counter Tugas Aktif
  const activeCount = tasks.filter((t) => !t.selesai).length;
  counter.textContent = `${activeCount} tugas aktif`;

  // Pesan jika daftar kosong
  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-msg">Tidak ada tugas dalam daftar ini.</li>`;
    return;
  }

  // Render Elemen Aman (Bebas XSS)
  filteredTasks.forEach((task) => {
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

    // 06. Aman: Pakai textContent
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

// Jalankan Render Pertama Kali
render();
