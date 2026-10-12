const students = [
  { roll: "CS001", name: "Student A" },
  { roll: "CS002", name: "Student B" },
  { roll: "CS003", name: "Student C" },
  { roll: "CS004", name: "Student D" },
  { roll: "CS005", name: "Student E" },
  { roll: "CS006", name: "Student F" }
];

const rows = document.getElementById("studentRows");
const dateInput = document.getElementById("attendanceDate");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const storageKey = "titansAttendanceRecords";
dateInput.value = new Date().toISOString().slice(0, 10);

function renderStudents(filter = "") {
  rows.innerHTML = "";
  const query = filter.trim().toLowerCase();
  students.filter(s => `${s.roll} ${s.name}`.toLowerCase().includes(query)).forEach(student => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${student.roll}</td><td>${student.name}</td>
      <td><select class="status-select" data-roll="${student.roll}" aria-label="Attendance for ${student.name}">
      <option value="">Choose status</option><option value="Present">Present</option><option value="Absent">Absent</option></select></td>`;
    rows.appendChild(tr);
  });
  updateSummary();
}
function getSelections() {
  return [...document.querySelectorAll(".status-select")].map(select => ({
    roll: select.dataset.roll,
    name: students.find(s => s.roll === select.dataset.roll).name,
    status: select.value
  }));
}
function updateSummary() {
  const selections = getSelections();
  const present = selections.filter(s => s.status === "Present").length;
  const absent = selections.filter(s => s.status === "Absent").length;
  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("presentCount").textContent = present;
  document.getElementById("absentCount").textContent = absent;
  document.getElementById("presentRate").textContent = `${Math.round(present / students.length * 100)}%`;
}
function readRecords() {
  try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
  catch { return []; }
}
function renderRecords() {
  const target = document.getElementById("recordsList");
  const records = readRecords().slice().reverse();
  if (!records.length) { target.innerHTML = '<p class="empty">No saved records yet.</p>'; return; }
  target.innerHTML = records.map(record => {
    const present = record.students.filter(s => s.status === "Present").length;
    const marked = record.students.filter(s => s.status).length;
    const rate = marked ? Math.round(present / marked * 100) : 0;
    return `<div class="record"><div><strong>${escapeHtml(record.className)} · ${record.date}</strong>
      <small>${present} present · ${record.students.filter(s => s.status === "Absent").length} absent · ${marked} marked</small></div>
      <span class="rate">${rate}% present</span></div>`;
  }).join("");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
rows.addEventListener("change", updateSummary);
searchInput.addEventListener("input", e => renderStudents(e.target.value));
document.getElementById("markAllPresent").addEventListener("click", () => {
  document.querySelectorAll(".status-select").forEach(select => select.value = "Present");
  updateSummary(); message.textContent = "All visible students marked present. Save to record the attendance.";
});
document.getElementById("clearButton").addEventListener("click", () => {
  document.querySelectorAll(".status-select").forEach(select => select.value = "");
  updateSummary(); message.textContent = "Selections cleared.";
});
document.getElementById("saveButton").addEventListener("click", () => {
  const selections = getSelections();
  if (selections.some(s => !s.status)) {
    message.textContent = "Please choose Present or Absent for every visible student before saving.";
    message.style.color = "#b45309"; return;
  }
  const records = readRecords();
  records.push({
    className: document.getElementById("className").value.trim() || "Class not specified",
    date: dateInput.value,
    students: students.map(s => {
      const select = document.querySelector(`.status-select[data-roll="${s.roll}"]`);
      return { ...s, status: select ? select.value : "" };
    })
  });
  localStorage.setItem(storageKey, JSON.stringify(records));
  message.style.color = "#176b43";
  message.textContent = "Attendance saved in this browser.";
  renderRecords();
});
document.getElementById("recordsButton").addEventListener("click", () => {
  renderRecords(); document.getElementById("recordsPanel").scrollIntoView({ behavior: "smooth" });
});
renderStudents();
renderRecords();
