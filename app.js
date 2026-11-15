// Multi-User Storage
let registeredUsers = JSON.parse(localStorage.getItem("cp_users")) || [
    {
        name: "Rameshwar Sharma",
        age: 74,
        bg: "O+",
        email: "rameshwar@example.com",
        caretakerEmail: "anjali.caretaker@example.com",
        passcode: "1234"
    }
];

let activeUser = JSON.parse(localStorage.getItem("cp_active_user")) || null;
let selectedLoginRole = "elderly";
let activeStream = null;

let medications = JSON.parse(localStorage.getItem("cp_meds")) || [
    { id: 1, name: "Telmisartan 40mg (BP Control)", slot: "Morning", time: "08:30", instruction: "Take after breakfast", stock: 12, status: "taken" },
    { id: 2, name: "Metformin 500mg (Diabetes Care)", slot: "Afternoon", time: "13:30", instruction: "Take after lunch", stock: 3, status: "missed" },
    { id: 3, name: "Atorvastatin 10mg", slot: "Night", time: "21:00", instruction: "Before bed", stock: 15, status: "pending" }
];

let appointments = JSON.parse(localStorage.getItem("cp_appts")) || [
    { id: 101, doctor: "Dr. Arvind Kulkarni (Cardiologist)", date: "2026-11-18", time: "10:30" }
];

let checklist = JSON.parse(localStorage.getItem("cp_chk")) || [
    { id: 1, text: "Morning Warm Water & Walk (सुबह की सैर)", done: true },
    { id: 2, text: "Blood Pressure Monitoring (बीपी जांच)", done: false },
    { id: 3, text: "Post-Lunch Rest (दोपहर का आराम)", done: false },
    { id: 4, text: "Evening Light Exercise (हल्का व्यायाम)", done: false }
];

let vitals = JSON.parse(localStorage.getItem("cp_vitals")) || { bp: "124/80", sugar: "108" };

let emailLogs = JSON.parse(localStorage.getItem("cp_logs")) || [
    { time: "08:35 AM", msg: "System Ready: Multi-user profile & proactive alert engine initialized." }
];

document.addEventListener("DOMContentLoaded", () => {
    if (activeUser) {
        document.getElementById("auth-screen").classList.add("hidden");
        document.getElementById("main-app").classList.remove("hidden");
        initDashboard();
    }
});

// Role & Auth Switching
function setLoginRole(role) {
    selectedLoginRole = role;
    document.getElementById("btn-role-elderly").className = role === "elderly" 
        ? "py-2 text-xs font-bold rounded-lg bg-white text-teal-700 shadow transition"
        : "py-2 text-xs font-bold rounded-lg text-slate-500 transition";
    document.getElementById("btn-role-caretaker").className = role === "caretaker" 
        ? "py-2 text-xs font-bold rounded-lg bg-white text-indigo-700 shadow transition"
        : "py-2 text-xs font-bold rounded-lg text-slate-500 transition";
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        document.getElementById("form-login").classList.remove("hidden");
        document.getElementById("form-register").classList.add("hidden");
        document.getElementById("tab-login").className = "flex-1 pb-2 text-sm font-bold text-teal-700 border-b-2 border-teal-600";
        document.getElementById("tab-register").className = "flex-1 pb-2 text-sm font-bold text-slate-400";
    } else {
        document.getElementById("form-login").classList.add("hidden");
        document.getElementById("form-register").classList.remove("hidden");
        document.getElementById("tab-register").className = "flex-1 pb-2 text-sm font-bold text-emerald-700 border-b-2 border-emerald-600";
        document.getElementById("tab-login").className = "flex-1 pb-2 text-sm font-bold text-slate-400";
    }
}

// Strict Email & Passcode Verification
function handleLogin() {
    const emailInput = document.getElementById("login-email").value.trim().toLowerCase();
    const passInput = document.getElementById("login-passcode").value.trim();

    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === emailInput && u.passcode === passInput);

    if (!matchedUser) {
        showToast("Invalid Email or Passcode! Check credentials or register new account.", "error");
        return;
    }

    activeUser = matchedUser;
    localStorage.setItem("cp_active_user", JSON.stringify(activeUser));
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
    initDashboard();
    showToast(`Authenticated as ${activeUser.name} (${selectedLoginRole.toUpperCase()})`, "success");
}

function handleRegister() {
    const name = document.getElementById("reg-name").value.trim();
    const age = document.getElementById("reg-age").value.trim();
    const bg = document.getElementById("reg-bg").value.trim();
    const email = document.getElementById("reg-user-email").value.trim().toLowerCase();
    const caretakerEmail = document.getElementById("reg-caretaker-email").value.trim().toLowerCase();
    const passcode = document.getElementById("reg-passcode").value.trim();

    if (!name || !email || !caretakerEmail || passcode.length !== 4) {
        showToast("Please fill all fields and set a 4-digit passcode.", "error");
        return;
    }

    const newUser = { name, age, bg, email, caretakerEmail, passcode };
    registeredUsers.push(newUser);
    localStorage.setItem("cp_users", JSON.stringify(registeredUsers));

    activeUser = newUser;
    localStorage.setItem("cp_active_user", JSON.stringify(activeUser));
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
    initDashboard();
    showToast(`Account created & verified for ${name}!`, "success");
}

function lockPortal() {
    activeUser = null;
    localStorage.removeItem("cp_active_user");
    document.getElementById("main-app").classList.add("hidden");
    document.getElementById("auth-screen").classList.remove("hidden");
}

function initDashboard() {
    if (activeUser) {
        document.getElementById("profile-name-age").textContent = `${activeUser.name}, ${activeUser.age} (${activeUser.bg})`;
        document.getElementById("profile-avatar").textContent = activeUser.name.split(" ").map(n=>n[0]).join("").toUpperCase();
        document.getElementById("caretaker-email-display").textContent = activeUser.caretakerEmail;
        document.getElementById("role-indicator").textContent = selectedLoginRole === "elderly" ? "Elderly Patient View" : "Family / Caretaker Admin";
    }
    document.getElementById("bp-value").textContent = vitals.bp;
    document.getElementById("sugar-value").textContent = `${vitals.sugar} mg/dL`;
    renderAll();
}

function renderAll() {
    saveState();
    renderMedications();
    renderAppointments();
    renderChecklist();
    renderLogs();
    updateAdherence();
}

function saveState() {
    localStorage.setItem("cp_meds", JSON.stringify(medications));
    localStorage.setItem("cp_appts", JSON.stringify(appointments));
    localStorage.setItem("cp_chk", JSON.stringify(checklist));
    localStorage.setItem("cp_logs", JSON.stringify(emailLogs));
    localStorage.setItem("cp_vitals", JSON.stringify(vitals));
}

// Medications with Accurate Stock Undo & Clear Statuses (Taken, Missed, Pending)
function renderMedications() {
    const container = document.getElementById("medication-list");
    container.innerHTML = "";

    medications.forEach(med => {
        const isTaken = med.status === "taken";
        const isMissed = med.status === "missed";
        const isLowStock = med.stock <= 4;

        let statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800"><i class="fa-regular fa-clock mr-1"></i> Pending</span>`;
        let borderClass = "border-slate-200";

        if (isTaken) {
            statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800"><i class="fa-solid fa-check-circle mr-1"></i> Taken</span>`;
            borderClass = "border-emerald-300 bg-emerald-50/20";
        } else if (isMissed) {
            statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800"><i class="fa-solid fa-circle-exclamation mr-1"></i> Missed Dose</span>`;
            borderClass = "border-rose-300 bg-rose-50/20";
        }

        const card = document.createElement("div");
        card.className = `bg-white rounded-2xl border ${borderClass} p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`;

        card.innerHTML = `
            <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">${med.slot} • ${med.time}</span>
                    ${statusBadge}
                    ${isLowStock ? `<span class="text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded animate-pulse">Low Stock: ${med.stock} left</span>` : `<span class="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Stock: ${med.stock} pills</span>`}
                </div>
                <h4 class="text-base font-extrabold text-slate-900">${med.name}</h4>
                <p class="text-xs text-slate-600">${med.instruction || 'Take as prescribed'}</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="speakReminder('${med.name}', '${med.time}')" class="p-2 bg-blue-50 text-blue-700 rounded-xl" title="Listen"><i class="fa-solid fa-volume-high"></i></button>
                ${!isTaken ? `
                    <button onclick="toggleMedStatus(${med.id}, 'taken')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl">Mark Taken</button>
                ` : `
                    <button onclick="toggleMedStatus(${med.id}, 'undo')" class="text-xs font-semibold border border-slate-300 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">Undo (+1 Stock)</button>
                `}
                <button onclick="deleteMed(${med.id})" class="p-2 bg-rose-50 text-rose-600 rounded-xl"><i class="fa-solid fa-trash text-xs"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Accurate Stock Increment/Decrement on Mark Taken & Undo
function toggleMedStatus(id, action) {
    const med = medications.find(m => m.id === id);
    if (!med) return;

    if (action === 'taken' && med.status !== 'taken') {
        med.status = 'taken';
        if (med.stock > 0) med.stock -= 1;
        addLog(`Dose taken: ${med.name}. Remaining stock: ${med.stock} pills.`);
        showToast(`${med.name} marked Taken! Stock updated.`, "success");
    } else if (action === 'undo' && med.status === 'taken') {
        med.status = 'pending';
        med.stock += 1; // Properly restores stock count!
        addLog(`Undo action: ${med.name} reverted to Pending. Stock restored to ${med.stock}.`);
        showToast(`Undo complete. Stock restored to ${med.stock}.`, "info");
    }
    renderAll();
}

function updateAdherence() {
    const total = medications.length;
    const taken = medications.filter(m => m.status === "taken").length;
    const pct = total === 0 ? 0 : Math.round((taken / total) * 100);
    document.getElementById("adherence-percentage").textContent = `${pct}%`;
    document.getElementById("adherence-count").textContent = `${taken}/${total}`;
}

// Vitals Update (BP & Sugar Both)
function openVitalsModal() {
    document.getElementById("input-bp").value = vitals.bp;
    document.getElementById("input-sugar").value = vitals.sugar;
    document.getElementById("vitals-modal").classList.remove("hidden");
}
function closeVitalsModal() { document.getElementById("vitals-modal").classList.add("hidden"); }

function saveVitals(e) {
    e.preventDefault();
    vitals.bp = document.getElementById("input-bp").value.trim();
    vitals.sugar = document.getElementById("input-sugar").value.trim();
    document.getElementById("bp-value").textContent = vitals.bp;
    document.getElementById("sugar-value").textContent = `${vitals.sugar} mg/dL`;
    closeVitalsModal();
    saveState();
    addLog(`Vitals Updated -> BP: ${vitals.bp}, Fasting Sugar: ${vitals.sugar} mg/dL`);
    showToast("Both BP & Sugar updated!", "success");
}

// Real Email Dispatch via Mailto Integration
function sendProactiveEmailAlert() {
    const caretaker = activeUser ? activeUser.caretakerEmail : "family@example.com";
    const patient = activeUser ? activeUser.name : "Patient";
    const missedMeds = medications.filter(m => m.status === "missed").map(m => m.name).join(", ") || "None";
    const lowStock = medications.filter(m => m.stock <= 4).map(m => `${m.name} (${m.stock} left)`).join(", ") || "All Sufficient";

    const subject = encodeURIComponent(`CarePulse Health Report: ${patient}`);
    const body = encodeURIComponent(
        `Hello Caretaker,\n\nHere is the live health & medication status for ${patient}:\n` +
        `- Blood Pressure: ${vitals.bp}\n` +
        `- Fasting Sugar: ${vitals.sugar} mg/dL\n` +
        `- Missed Medications: ${missedMeds}\n` +
        `- Low Stock Medicines: ${lowStock}\n\n` +
        `Sent via CarePulse Pro Ecosystem.`
    );

    addLog(`Proactive Email Report dispatched to ${caretaker}.`);
    showToast(`Opening email client to send report to ${caretaker}...`, "success");
    window.open(`mailto:${caretaker}?subject=${subject}&body=${body}`, "_blank");
}

function triggerRealSOS() {
    const caretaker = activeUser ? activeUser.caretakerEmail : "family@example.com";
    const patient = activeUser ? activeUser.name : "Patient";
    const subject = encodeURIComponent(`URGENT SOS EMERGENCY: ${patient} Needs Help!`);
    const body = encodeURIComponent(`EMERGENCY ALERT!\n\n${patient} has triggered the SOS button on CarePulse Pro.\nLast Recorded Vitals -> BP: ${vitals.bp}, Sugar: ${vitals.sugar} mg/dL.\nPlease contact immediately!`);

    addLog(`🚨 SOS EMERGENCY dispatched to ${caretaker}!`);
    showToast("🚨 SOS Alert Triggered! Dispatching emergency email...", "error");
    if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Emergency SOS alert sent to family."));
    }
    window.open(`mailto:${caretaker}?subject=${subject}&body=${body}`, "_blank");
}

// Real Webcam Video Consultation
async function openVideoConsultModal() {
    document.getElementById("video-modal").classList.remove("hidden");
    const videoEl = document.getElementById("consult-video-feed");
    try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoEl.srcObject = activeStream;
    } catch (err) {
        showToast("Camera permission denied or unavailable. Running simulated feed.", "info");
    }
}

function closeVideoConsultModal() {
    if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
    }
    document.getElementById("video-modal").classList.add("hidden");
}

// Real Camera Strip Scanner
async function openCameraScanner() {
    document.getElementById("scanner-modal").classList.remove("hidden");
    const videoEl = document.getElementById("scanner-video-feed");
    try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoEl.srcObject = activeStream;
    } catch (err) {
        showToast("Camera access not available; using capture mode.", "info");
    }
}

function closeCameraScanner() {
    if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
    }
    document.getElementById("scanner-modal").classList.add("hidden");
}

function captureScannedMedicine(name, slot, time, stock) {
    medications.push({ id: Date.now(), name, slot, time, instruction: "Extracted via Live Camera OCR", stock, status: "pending" });
    closeCameraScanner();
    renderAll();
    addLog(`Camera OCR Scanner extracted: ${name} (${stock} pills)`);
    showToast(`Medicine Extracted: ${name}`, "success");
}

// Voice Assistant (Hindi & English)
function askVoiceAssistant(lang) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const nextMed = medications.find(m => m.status !== "taken");
    let text = "";

    if (lang === 'hindi') {
        text = nextMed 
            ? `आपकी अगली दवाई ${nextMed.name} है, जिसे ${nextMed.slot} में ${nextMed.time} पर लेना है।`
            : "आज की सभी दवाइयां पूरी हो चुकी हैं।";
    } else {
        text = nextMed 
            ? `Your next medicine is ${nextMed.name} scheduled for ${nextMed.slot} at ${nextMed.time}.`
            : "All medications for today are completed.";
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === 'hindi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utt);
    showToast(text, "info");
}

function speakReminder(name, time) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Reminder: Take ${name} at ${time}`));
    }
}

// Checklist, Add Med, Appointments & Logs
function renderChecklist() {
    const container = document.getElementById("checklist-container");
    container.innerHTML = "";
    const doneCount = checklist.filter(c => c.done).length;
    document.getElementById("checklist-progress").textContent = `${doneCount}/${checklist.length} Completed`;
    checklist.forEach(item => {
        const div = document.createElement("div");
        div.className = `p-3 rounded-xl border flex items-center justify-between gap-2 ${item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`;
        div.innerHTML = `<span class="text-xs font-semibold ${item.done ? 'line-through text-slate-500' : 'text-slate-800'}">${item.text}</span>
            <button onclick="toggleChecklist(${item.id})" class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${item.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}"><i class="fa-solid fa-check"></i></button>`;
        container.appendChild(div);
    });
}
function toggleChecklist(id) {
    const item = checklist.find(c => c.id === id);
    if (item) { item.done = !item.done; renderAll(); }
}

function openMedModal() { document.getElementById("med-modal").classList.remove("hidden"); }
function closeMedModal() { document.getElementById("med-modal").classList.add("hidden"); }
function saveMedication(e) {
    e.preventDefault();
    const name = document.getElementById("med-name").value.trim();
    const slot = document.getElementById("med-slot").value;
    const time = document.getElementById("med-time").value;
    const stock = parseInt(document.getElementById("med-stock").value) || 10;
    const status = document.getElementById("med-status").value;
    const instruction = document.getElementById("med-instruction").value.trim();
    medications.push({ id: Date.now(), name, slot, time, instruction, stock, status });
    closeMedModal();
    renderAll();
    showToast("Medication saved!", "success");
}
function deleteMed(id) { medications = medications.filter(m => m.id !== id); renderAll(); }

function renderAppointments() {
    document.getElementById("appointment-list").innerHTML = appointments.map(a => `
        <div class="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex justify-between items-center text-xs">
            <div><strong>${a.doctor}</strong><br>${a.date} at ${a.time}</div>
            <button onclick="deleteAppt(${a.id})" class="text-rose-600"><i class="fa-solid fa-trash"></i></button>
        </div>`).join("");
}
function openApptModal() { document.getElementById("appt-modal").classList.remove("hidden"); }
function closeApptModal() { document.getElementById("appt-modal").classList.add("hidden"); }
function saveAppointment(e) {
    e.preventDefault();
    appointments.push({
        id: Date.now(),
        doctor: document.getElementById("appt-doctor").value.trim(),
        date: document.getElementById("appt-date").value,
        time: document.getElementById("appt-time").value
    });
    closeApptModal();
    renderAll();
    showToast("Appointment saved!", "success");
}
function deleteAppt(id) { appointments = appointments.filter(a => a.id !== id); renderAll(); }

function addLog(msg) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    emailLogs.unshift({ time, msg });
    saveState();
    renderLogs();
}
function renderLogs() {
    document.getElementById("email-log-list").innerHTML = emailLogs.map(l => `
        <div class="p-2 rounded bg-slate-50 border flex gap-2"><span class="font-bold text-teal-700">${l.time}</span><span>${l.msg}</span></div>
    `).join("");
}

function showToast(msg, type="info") {
    const container = document.getElementById("toast-container");
    const t = document.createElement("div");
    const colors = { success: "bg-emerald-800 text-white", error: "bg-rose-700 text-white", info: "bg-slate-800 text-white" };
    t.className = `${colors[type]} px-4 py-3 rounded-xl shadow-xl text-xs font-bold`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}