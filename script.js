/*
============================================================
  VisionOps Business Operations Platform
  Shared JavaScript
  Creator: Dominique McClaney

  The code below powers the complete interactive prototype:
  theme persistence, simulated metrics, incident filtering,
  recommendation updates, report export, ROI calculations,
  form validation, and the automatic footer year.
============================================================
*/

// ------------------------------
// Theme preference
// ------------------------------
const themeButton = document.getElementById("themeButton");
const savedTheme = localStorage.getItem("visionops-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

function updateThemeButton() {
  if (!themeButton) return;
  const isDark = document.body.classList.contains("dark");
  themeButton.textContent = isDark ? "Light Mode" : "Dark Mode";
  themeButton.setAttribute("aria-pressed", String(isDark));
}

if (themeButton) {
  updateThemeButton();
  themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    localStorage.setItem("visionops-theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeButton();
  });
}

// ------------------------------
// Live dashboard simulation
// ------------------------------
const packetCount = document.getElementById("packetCount");
const activeDevices = document.getElementById("activeDevices");
const modelConfidence = document.getElementById("modelConfidence");
const uptime = document.getElementById("uptime");
const refreshButton = document.getElementById("refreshButton");
let packets = 12480;
let secondsOnline = 0;

function updateDashboardMetrics() {
  packets += Math.floor(Math.random() * 22) + 5;
  secondsOnline += 1;
  if (packetCount) packetCount.textContent = packets.toLocaleString();
  if (activeDevices) activeDevices.textContent = String(23 + Math.floor(Math.random() * 3));
  if (modelConfidence) modelConfidence.textContent = (93.4 + Math.random() * 2.1).toFixed(1) + "%";
  if (uptime) uptime.textContent = secondsOnline + " sec";
}

if (packetCount) {
  window.setInterval(updateDashboardMetrics, 1000);
}

if (refreshButton) {
  refreshButton.addEventListener("click", function () {
    updateDashboardMetrics();
    refreshButton.textContent = "Data Refreshed";
    window.setTimeout(function () { refreshButton.textContent = "Refresh Data"; }, 1400);
  });
}

// ------------------------------
// Incident filtering and AI-assisted recommendation
// ------------------------------
const severityFilter = document.getElementById("severityFilter");
const eventRows = document.querySelectorAll("#eventTable tbody tr");
const recommendationText = document.getElementById("recommendationText");
const actionList = document.getElementById("actionList");

const recommendationLibrary = {
  critical: {
    text: "Prioritize this incident because it may interrupt service or create a safety or compliance risk.",
    actions: ["Confirm the issue using a second source.", "Notify the responsible manager.", "Record the response and resolution time."]
  },
  warn: {
    text: "Review this warning before it becomes a larger interruption. Compare the current reading with its normal operating range.",
    actions: ["Verify the threshold and recent trend.", "Assign preventive follow-up.", "Monitor the next status update."]
  },
  info: {
    text: "No urgent action is required. Confirm the information and include it in the next operations summary if relevant.",
    actions: ["Validate that the activity completed.", "Close or archive the event.", "Include it in routine reporting if needed."]
  }
};

function showRecommendation(severity, systemName, issueText) {
  if (!recommendationText || !actionList) return;
  const recommendation = recommendationLibrary[severity] || recommendationLibrary.info;
  recommendationText.textContent = systemName + ": " + issueText + ". " + recommendation.text;
  actionList.innerHTML = "";
  recommendation.actions.forEach(function (action) {
    const item = document.createElement("li");
    item.textContent = action;
    actionList.appendChild(item);
  });
}

if (severityFilter) {
  severityFilter.addEventListener("change", function () {
    const selectedSeverity = severityFilter.value;
    eventRows.forEach(function (row) {
      row.style.display = selectedSeverity === "all" || row.dataset.severity === selectedSeverity ? "" : "none";
    });
  });
}

eventRows.forEach(function (row) {
  row.addEventListener("click", function () {
    eventRows.forEach(function (item) { item.classList.remove("selected-row"); });
    row.classList.add("selected-row");
    showRecommendation(row.dataset.severity, row.dataset.system, row.dataset.issue);
  });
});

const completeActionButton = document.getElementById("completeActionButton");
const actionStatus = document.getElementById("actionStatus");
if (completeActionButton && actionStatus) {
  completeActionButton.addEventListener("click", function () {
    actionStatus.textContent = "Recommendation reviewed by a human operator. No automatic action was taken.";
    actionStatus.classList.remove("hidden");
  });
}

// ------------------------------
// Downloadable operations summary
// ------------------------------
const exportButton = document.getElementById("exportButton");
if (exportButton) {
  exportButton.addEventListener("click", function () {
    const visibleRows = Array.from(eventRows).filter(function (row) { return row.style.display !== "none"; });
    const incidentLines = visibleRows.map(function (row) {
      const cells = row.querySelectorAll("td");
      return "- " + cells[0].textContent + " | " + cells[1].textContent + " | " + cells[2].textContent + " | " + cells[3].textContent.trim() + " | " + cells[4].textContent;
    });
    const report = [
      "VISIONOPS OPERATIONS SUMMARY",
      "Generated: " + new Date().toLocaleString(),
      "",
      "Events processed: " + (packetCount ? packetCount.textContent : "N/A"),
      "Active systems: " + (activeDevices ? activeDevices.textContent : "N/A"),
      "AI confidence: " + (modelConfidence ? modelConfidence.textContent : "N/A"),
      "",
      "VISIBLE INCIDENTS",
      ...incidentLines,
      "",
      "Note: This prototype uses simulated data. AI-assisted recommendations require human review."
    ].join("\n");
    const file = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "VisionOps_Operations_Summary.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });
}

// ------------------------------
// ROI calculator
// ------------------------------
const roiForm = document.getElementById("roiForm");
const roiResult = document.getElementById("roiResult");
const roiDetails = document.getElementById("roiDetails");

function calculateSavings() {
  if (!roiForm || !roiResult) return;
  const employees = Number(document.getElementById("employees").value);
  const hoursSaved = Number(document.getElementById("hoursSaved").value);
  const hourlyCost = Number(document.getElementById("hourlyCost").value);
  const monthlySavings = employees * hoursSaved * hourlyCost * 4.33;
  roiResult.textContent = monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  if (roiDetails) roiDetails.textContent = employees + " employees × " + hoursSaved + " hours × $" + hourlyCost + " × 4.33 weeks.";
}

if (roiForm) {
  roiForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!roiForm.checkValidity()) { roiForm.reportValidity(); return; }
    calculateSavings();
  });
  calculateSavings();
}

// ------------------------------
// Demonstration contact form
// ------------------------------
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
if (contactForm && formMessage) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
    const name = document.getElementById("name").value.trim();
    const company = document.getElementById("company").value.trim();
    const area = document.getElementById("businessArea").value;
    formMessage.textContent = "Thank you, " + name + ". A demonstration request for " + company + " has been prepared for the " + area + " use case. No data was transmitted.";
    formMessage.classList.remove("hidden");
    contactForm.reset();
  });
}

// ------------------------------
// Footer year
// ------------------------------
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
