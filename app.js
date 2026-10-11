// Helper API yang mengecek res.ok dan melempar error dari pesan server
async function api(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error: ${res.status}`);
  }
  return res.json();
}

let tasks = [];
let matkulList = [];
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

// 01 & 05. Muat awal data dari server secara paralel dengan Promise.all
async function initialLoad() {
  taskList.innerHTML = `<li class="empty-msg">Memuat data dari server...</li>`;
  try {
    // Memuat daftar tugas dan mata kuliah secara paralel
    const [fetchedTasks, fetchedMatkul] = await Promise.all([
      api("/api/tugas"),
      api("/api/matkul"),
    ]);

    tasks = fetchedTasks;
    matkulList = fetchedMatkul;

    // Render pilihan dropdown mata kuliah
    matkulSelect.innerHTML = matkulList
      .map((m) => `<option value="${m}">${m}</option>`)
      .join("");
    render();
  } catch (err) {
    taskList.innerHTML = `<li class="empty-msg" style="color: #ef4444;">Gagal memuat data: ${err.message} <br><button onclick="initialLoad()" style="margin-top:8px; padding:4px 8px; cursor:pointer;">Coba Lagi</button></li>`;
  }
}

// 02. Tambah Tugas via POST /api/tugas
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const judul = judulInput.value.trim();
  const matkul = matkulSelect.value;
  const deadline = deadlineInput.value;

  if (judul.length < 3) {
    errorMsg.textContent = "Judul tugas minimal 3 karakter!";
    return;
  }
  if (!deadline) {
    errorMsg.textContent = "Deadline wajib diisi!";
    return;
  }

  errorMsg.textContent = "";
  const submitBtn = taskForm.querySelector("button");
  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim...";

  try {
    const newTask = { judul, matkul, deadline, selesai: false };
    const savedTask = await api("/api/tugas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    tasks.push(savedTask);
    render();

    judulInput.value = "";
    deadlineInput.value = "";
  } catch (err) {
    errorMsg.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Tambah";
  }
});

// 03. Selesai & Hapus lewat Event Delegation (PATCH & DELETE)
taskList.addEventListener("click", async (e) => {
  const item = e.target.closest(".task-item");
  if (!item) return;

  const id = item.dataset.id;

  // Toggle Selesai (PATCH /api/tugas/:id)
  if (e.target.classList.contains("task-checkbox")) {
    const isChecked = e.target.checked;
    try {
      const updated = await api(`/api/tugas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selesai: isChecked }),
      });

      tasks = tasks.map((task) => (task.id == id ? updated : task));
      render();
    } catch (err) {
      alert(`Gagal memperbarui status: ${err.message}`);
      e.target.checked = !isChecked; // Kembalikan posisi checkbox jika gagal
    }
  }

  // Tombol Hapus (DELETE /api/tugas/:id)
  if (e.target.classList.contains("delete-btn")) {
    try {
      await api(`/api/tugas/${id}`, { method: "DELETE" });
      tasks = tasks.filter((task) => task.id != id);
      render();
    } catch (err) {
      alert(`Gagal menghapus tugas: ${err.message}`);
    }
  }
});

// 04. Filter Tombol
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Fungsi Render Utama
function render() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "aktif") return !task.selesai;
    if (currentFilter === "selesai") return task.selesai;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.selesai).length;
  counter.textContent = `${activeCount} tugas aktif`;

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-msg">Tidak ada tugas dalam daftar ini.</li>`;
    return;
  }

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

    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.judul; // Aman dari XSS

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

// Mulai aplikasi dengan memuat data dari server
initialLoad();
