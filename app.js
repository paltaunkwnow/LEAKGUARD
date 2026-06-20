// LeakGuard SaaS Application Engine

// ==========================================
// Firebase Initialization & Auth Helpers
// ==========================================
let isAuthenticated = false;
let firebaseInitialized = false;
let authInstance = null;

function initFirebase() {
  const storedConfig = localStorage.getItem('firebaseConfig');
  if (storedConfig) {
    try {
      const config = JSON.parse(storedConfig);
      if (config.apiKey && config.projectId) {
        firebase.initializeApp(config);
        authInstance = firebase.auth();
        firebaseInitialized = true;
        console.log("Firebase initialized successfully.");

        // Listen for auth state changes
        authInstance.onAuthStateChanged((user) => {
          if (user) {
            isAuthenticated = true;
            activeAnalyst.name = user.email.split('@')[0];
            activeAnalyst.email = user.email;
            activeAnalyst.role = "Firebase Verified Analyst";
            activeAnalyst.clearance = "L3 Firebase Admin";
            updateAnalystUI();
            sessionStorage.setItem('userEmail', user.email);

            const pendingCheck = sessionStorage.getItem('pendingBreachCheck');
            if (pendingCheck === user.email) {
              sessionStorage.removeItem('pendingBreachCheck');
              runAccountBreachAlert(user.email, 'login');
            } else if (sessionStorage.getItem('breachCheckedSession') !== user.email) {
              sessionStorage.setItem('breachCheckedSession', user.email);
              runAccountBreachAlert(user.email, 'session');
            }

            if (currentTab === 'login') {
              navigateTo('dashboard');
            }
          } else {
            isAuthenticated = false;
            if (currentTab !== 'landing' && currentTab !== 'login') {
              navigateTo('login');
            }
          }
        });
      }
    } catch (e) {
      console.error("Error parsing Firebase configuration:", e);
      showToast("Error en la configuración de Firebase", "error");
    }
  } else {
    console.log("No Firebase config found. Running in offline/demo mode.");
  }
  
  // Check session storage for offline bypass
  if (sessionStorage.getItem('demoBypassActive') === 'true') {
    isAuthenticated = true;
  }
}

function updateAnalystUI() {
  const nameEl = document.getElementById('analyst-profile-name');
  const roleEl = document.getElementById('analyst-profile-role');
  const avatarEl = document.getElementById('analyst-avatar-img');
  
  if (nameEl) nameEl.innerText = activeAnalyst.name;
  if (roleEl) roleEl.innerText = activeAnalyst.role;
  if (avatarEl && activeAnalyst.avatar) avatarEl.src = activeAnalyst.avatar;
}

// Auth View controls
function toggleAuthTab(tab) {
  const loginTab = document.getElementById('login-tab-btn');
  const registerTab = document.getElementById('register-tab-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (tab === 'login') {
    loginTab.classList.add('border-cyan-400', 'text-cyan-400');
    loginTab.classList.remove('border-transparent', 'text-slate-400');
    registerTab.classList.remove('border-cyan-400', 'text-cyan-400');
    registerTab.classList.add('border-transparent', 'text-slate-400');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    registerTab.classList.add('border-cyan-400', 'text-cyan-400');
    registerTab.classList.remove('border-transparent', 'text-slate-400');
    loginTab.classList.remove('border-cyan-400', 'text-cyan-400');
    loginTab.classList.add('border-transparent', 'text-slate-400');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

function handleAuthSubmit(event, action) {
  event.preventDefault();
  const emailInput = document.getElementById(action === 'login' ? 'login-email' : 'register-email').value.trim();
  const passwordInput = document.getElementById(action === 'login' ? 'login-password' : 'register-password').value;

  if (firebaseInitialized && authInstance) {
    if (action === 'login') {
      authInstance.signInWithEmailAndPassword(emailInput, passwordInput)
        .then(() => {
          sessionStorage.setItem('pendingBreachCheck', emailInput);
          showToast("Autenticación exitosa — verificando filtraciones...", "success");
          isAuthenticated = true;
        })
        .catch((error) => {
          console.error(error);
          showToast(`Error: ${error.message}`, "error");
        });
    } else {
      authInstance.createUserWithEmailAndPassword(emailInput, passwordInput)
        .then(() => {
          sessionStorage.setItem('pendingBreachCheck', emailInput);
          showToast("Cuenta creada — verificando filtraciones de tu correo...", "success");
          isAuthenticated = true;
        })
        .catch((error) => {
          console.error(error);
          showToast(`Error: ${error.message}`, "error");
        });
    }
  } else {
    // Local fallback/mock authentication
    if (action === 'login') {
      if (emailInput && passwordInput.length >= 6) {
        completeDemoAuth(emailInput, 'login');
      } else {
        showToast("Contraseña debe tener al menos 6 caracteres", "error");
      }
    } else {
      completeDemoAuth(emailInput, 'register');
    }
  }
}

async function completeDemoAuth(emailInput, action) {
  showToast(action === 'register' ? "Registro completado (Demo)" : "Inicio de sesión (Demo)", "success");
  isAuthenticated = true;
  activeAnalyst.name = emailInput.split('@')[0];
  activeAnalyst.email = emailInput;
  activeAnalyst.role = "Demo Analyst";
  updateAnalystUI();
  sessionStorage.setItem('demoBypassActive', 'true');
  sessionStorage.setItem('userEmail', emailInput);
  await runAccountBreachAlert(emailInput, action);
  navigateTo('dashboard');
}

function checkAuthAndEnter() {
  if (isAuthenticated) {
    navigateTo('dashboard');
  } else {
    navigateTo('login');
  }
}

function handleSignOut() {
  if (firebaseInitialized && authInstance) {
    authInstance.signOut()
      .then(() => {
        showToast("Sesión cerrada", "info");
        isAuthenticated = false;
        sessionStorage.removeItem('demoBypassActive');
        sessionStorage.removeItem('breachCheckedSession');
        sessionStorage.removeItem('pendingBreachCheck');
        sessionStorage.removeItem('userEmail');
        navigateTo('landing');
      })
      .catch((error) => {
        showToast("Error al cerrar sesión", "error");
      });
  } else {
    showToast("Sesión cerrada (Modo Demo)", "info");
    isAuthenticated = false;
    sessionStorage.removeItem('demoBypassActive');
    sessionStorage.removeItem('breachCheckedSession');
    sessionStorage.removeItem('pendingBreachCheck');
    sessionStorage.removeItem('userEmail');
    navigateTo('landing');
  }
}

function toggleFirebaseConfigModal() {
  const modal = document.getElementById('firebase-config-modal');
  modal.classList.toggle('hidden');
  
  if (!modal.classList.contains('hidden')) {
    const input = document.getElementById('firebase-json-input');
    const stored = localStorage.getItem('firebaseConfig');
    if (stored) {
      input.value = JSON.stringify(JSON.parse(stored), null, 2);
    } else {
      input.value = "";
    }
  }
}

function saveFirebaseConfig() {
  const rawJson = document.getElementById('firebase-json-input').value.trim();
  if (!rawJson) {
    showToast("Introduce un objeto JSON de configuración válido", "error");
    return;
  }
  
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed.apiKey || !parsed.projectId) {
      showToast("La configuración debe contener apiKey y projectId", "error");
      return;
    }
    
    localStorage.setItem('firebaseConfig', JSON.stringify(parsed));
    showToast("Configuración guardada. Reiniciando portal...", "success");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (e) {
    showToast("JSON inválido", "error");
  }
}

function clearFirebaseConfig() {
  localStorage.removeItem('firebaseConfig');
  showToast("Configuración de Firebase eliminada. Reiniciando...", "info");
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}

function bypassAuthForDemo() {
  isAuthenticated = true;
  sessionStorage.setItem('demoBypassActive', 'true');
  showToast("Acceso bypass con éxito", "success");
  navigateTo('dashboard');
}

// 1. Initial Mock Threat Intelligence Database
let threats = [
  {
    id: "TR-2026-049",
    date: "2026-06-20",
    actor: "LockBit 3.0",
    victim: "Medix Healthcare Group",
    sector: "Healthcare",
    country: "United States",
    riskScore: 92,
    confidence: 96,
    status: "Critical",
    verificationStatus: "Pending Review",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: true,
      knownRansomwareActor: true,
      publicEvidenceAvailable: true
    },
    businessImpact: "Exposed health records violating HIPAA standards. Potential ransomware extortion amount set to $4.2M. Class-action liability risk and severe reputation damage across 14 hospitals.",
    technicalImpact: "Active Directory domain controller compromised. Extraction of 250GB SQL databases containing patient PII, EHR systems schema, and administrator password hashes (NTLM).",
    actions: {
      immediate: "Isolate AD domain controllers and revoke active Kerberos TGT tickets. Deploy endpoint isolation policies to all hospital servers.",
      hours24: "Force global password reset for all administrative and user credentials. Notify local CISA and HHS cyber defense centers.",
      days7: "Perform comprehensive active directory audit, implement micro-segmentation for EHR networks, and rebuild domain trusts."
    },
    evidence: {
      source: "LockBit Ransomware Disclosure Blog (Tor Onion V3)",
      screenshot: "lockbit_evidence.png",
      extracted: `{"target_id": "MEDIX-HC-09", "dump_size_gb": 248.5, "sample_files": ["patient_billing_details_2025.csv", "admin_hashes.txt", "ehr_database_backup.sql"], "compromise_vector": "VPN exploit (CVE-2024-38472)"}`,
      summary: "AI-generated review: Leak identified on LockBit 3.0 onion repository. Critical matching signatures detected for database structure, medical record IDs, and employee directory records. Verification of file samples confirms active credentials hashes."
    }
  },
  {
    id: "TR-2026-048",
    date: "2026-06-19",
    actor: "Storm-0811",
    victim: "Apex Fintech Services",
    sector: "Finance",
    country: "United Kingdom",
    riskScore: 88,
    confidence: 90,
    status: "High",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: true,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Risk of direct financial fraud, wire diversion, and regulatory penalty under FCA. Market capitalization could suffer if systemic trading leaks are revealed.",
    technicalImpact: "AWS access keys, API secrets, and financial ledger source code leaked via public GitHub repository containing hardcoded secrets.",
    actions: {
      immediate: "Rotate all AWS IAM credentials and revoke the compromised security access keys immediately.",
      hours24: "Audit cloud-trail logs for unauthorized infrastructure access or anomalous data extraction.",
      days7: "Implement automated secret scanning (TruffleHog) in CI/CD pipeline and transition to IAM Roles / AWS STS temporary tokens."
    },
    evidence: {
      source: "GitHub Public Leak Repository (User: apex-developer-temp)",
      screenshot: "github_leak.png",
      extracted: `AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"\nAWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"\nSTRIPE_API_LIVE_KEY = "sk_live_51Nz..."`,
      summary: "AI-generated review: Source code leak detected containing functional live production API keys and cloud deployment credentials. Keys validated against AWS authorization responses."
    }
  },
  {
    id: "TR-2026-047",
    date: "2026-06-18",
    actor: "ShinyHunters",
    victim: "ShopSphere E-Commerce",
    sector: "Technology",
    country: "Canada",
    riskScore: 78,
    confidence: 85,
    status: "High",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: false,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Loss of customer trust. Compliance investigations from PIPEDA. Cost of notification and credit monitoring for 1.2 million affected users.",
    technicalImpact: "Database dump containing customer profiles: Names, email addresses, phone numbers, salt-hashed passwords, and last 4 digits of cards.",
    actions: {
      immediate: "Send mandatory password reset notifications to all customers. Revoke database access privileges for the compromised service account.",
      hours24: "Verify if salt algorithms are sufficiently secure (bcrypt/scrypt) against cracking attempts.",
      days7: "Upgrade server infrastructure database protections and deploy web application firewall (WAF) to prevent SQL injections."
    },
    evidence: {
      source: "BreachForums Database Listing",
      screenshot: "breachforums_evidence.png",
      extracted: `{"record_count": 1200000, "fields": ["username", "email", "password_hash_bcrypt", "phone", "zipcode"], "price_credits": 250}`,
      summary: "AI-generated review: Database dump listing uploaded to cybercrime forum. Sample records verified matching valid emails and real geographical distributions."
    }
  },
  {
    id: "TR-2026-046",
    date: "2026-06-17",
    actor: "Volt Typhoon",
    victim: "Pacifica Grid Solutions",
    sector: "Energy",
    country: "United States",
    riskScore: 95,
    confidence: 88,
    status: "Critical",
    verificationStatus: "Pending Review",
    whyCritical: {
      credentialsExposed: false,
      financialRecordsAffected: false,
      knownRansomwareActor: false,
      publicEvidenceAvailable: false
    },
    businessImpact: "Critical infrastructure disruption risks. Cyber-espionage operations targeting network layout coordinates and OT operational flow configurations.",
    technicalImpact: "Living-off-the-land techniques detected. Exfiltration of SCADA network topology maps, industrial router firmware, and remote maintenance logs.",
    actions: {
      immediate: "Terminate all active VPN connections from remote utility support zones. Enable mandatory multi-factor authentication (MFA).",
      hours24: "Conduct deep host forensics on utility jump servers. Look for unauthorized PowerShell or WMI queries.",
      days7: "Air-gap critical OT control networks from general IT business networks. Redesign operational control segment credentials."
    },
    evidence: {
      source: "CISA OSINT & Encrypted Telegram Channel Exfiltration Feed",
      screenshot: "scada_topology.png",
      extracted: `{"network_segment": "OT-ZONE-04", "scada_protocol": "DNP3", "target_ips": ["10.240.11.4", "10.240.12.18"], "firmware_version": "GE-MDS-v4.1.9"}`,
      summary: "AI-generated review: Detected indicators of compromise match Volt Typhoon signature. SCADA network maps shared on closed state-sponsored communication logs."
    }
  },
  {
    id: "TR-2026-045",
    date: "2026-06-16",
    actor: "Lazarus Group",
    victim: "BancGlobal International",
    sector: "Finance",
    country: "Singapore",
    riskScore: 91,
    confidence: 92,
    status: "Critical",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: true,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Systemic risk to transactional settlement channels. Immediate SEC/Regulatory disclosure required. Potential direct loss of cryptocurrency or fiat reserves.",
    technicalImpact: "SWIFT transfer system server implants. Exfiltration of transaction logging templates and database security configurations.",
    actions: {
      immediate: "Quarantine SWIFT network interface terminals. Perform forensic memory capture of active communication processes.",
      hours24: "Check for malicious service creations or binary replacements in windows/system32 paths.",
      days7: "Implement strict hardware-based security keys for transaction approvals. Conduct continuous network traffic inspection."
    },
    evidence: {
      source: "DarkWeb PasteBin & Threat Research Aggregator",
      screenshot: "swift_malware.png",
      extracted: `{"implant_hash": "2f40b2a8d568c7320b9ee23a492f16ef0a41d9c1db169fe5a109f0293bf6f3a1", "target_process": "swift_gate.exe"}`,
      summary: "AI-generated review: Verification of SWIFT transaction processor logs matching verified target. Code signature corresponds to Lazarus-linked remote access Trojans."
    }
  },
  {
    id: "TR-2026-044",
    date: "2026-06-15",
    actor: "Clop Ransomware",
    victim: "United Logistics Corp",
    sector: "Government",
    country: "Germany",
    riskScore: 72,
    confidence: 94,
    status: "Medium",
    verificationStatus: "Rejected Incident",
    whyCritical: {
      credentialsExposed: false,
      financialRecordsAffected: false,
      knownRansomwareActor: true,
      publicEvidenceAvailable: true
    },
    businessImpact: "Potential supply chain disruption and delay in federal shipping contracts. Low impact as records were outdated archive folders from 2018.",
    technicalImpact: "Exfiltration of obsolete 2018 logistics schedules, public pricing structures, and legacy shipping records.",
    actions: {
      immediate: "Verify firewall configurations against CVE-2023-34362 (MOVEit Transfer vulnerability) patches.",
      hours24: "Confirm the data belongs strictly to historical legacy servers with no live connection to active logistics systems.",
      days7: "Audit data retention policies and permanently delete orphaned databases and archives."
    },
    evidence: {
      source: "Clop '_MOVEit Leak' Portal",
      screenshot: "clop_evidence.png",
      extracted: `{"dump_archive": "UNITED_LOGISTICS_2018_ARCHIVE.tar.gz", "size_mb": 1420}`,
      summary: "AI-generated review: Ransomware claim published. Analysis of files reveals that all data is historical (2018) and lacks active, confidential credentials or operational data."
    }
  },
  {
    id: "TR-2026-043",
    date: "2026-06-14",
    actor: "Unknown Hacktivist",
    victim: "EduCloud Learning Platform",
    sector: "Technology",
    country: "Australia",
    riskScore: 45,
    confidence: 72,
    status: "Low",
    verificationStatus: "Pending Review",
    whyCritical: {
      credentialsExposed: false,
      financialRecordsAffected: false,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Minimal financial impact. Minor public relations embarrassment due to platform defacement threat.",
    technicalImpact: "Defacement scripts targeting marketing subdomains, database schema details leaked but no patient or student record data accessible.",
    actions: {
      immediate: "Restore marketing landing page from clean repository backup. Close port 22 open on public IP.",
      hours24: "Perform vulnerability scan on front-end servers to identify CMS plug-in exploits.",
      days7: "Move public WordPress files onto static AWS S3 buckets to reduce target vulnerability area."
    },
    evidence: {
      source: "Twitter Disclosure Link",
      screenshot: "twitter_defacement.png",
      extracted: `{"defaced_subdomain": "blog.educloud.edu.au", "defacer_signature": "AnonSec_2026"}`,
      summary: "AI-generated review: Public post claiming breach. Verification confirms target subdomain displayed custom hacker logo, indicating superficial system modifications."
    }
  },
  {
    id: "TR-2026-042",
    date: "2026-06-13",
    actor: "ALPHV BlackCat",
    victim: "CareFirst Clinical Lab",
    sector: "Healthcare",
    country: "United Kingdom",
    riskScore: 84,
    confidence: 89,
    status: "High",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: false,
      knownRansomwareActor: true,
      publicEvidenceAvailable: true
    },
    businessImpact: "Severe HIPAA/GDPR penalty danger. Lab operational delays affecting emergency diagnosis timelines.",
    technicalImpact: "Compromised Citrix gateway credentials. Extracted 80GB of patient blood sample panels and employee directories.",
    actions: {
      immediate: "Deactivate the compromised Citrix user accounts. Block indicators of compromise (IPs, file hashes) in EDR platform.",
      hours24: "Implement patch updates on Citrix ADC infrastructure to protect against remote code execution.",
      days7: "Enforce multi-factor authentication for external portal users and restrict API query ranges."
    },
    evidence: {
      source: "ALPHV Onion Leak Site",
      screenshot: "alphv_evidence.png",
      extracted: `{"file_list": ["patient_lab_results_2026_Q1.xlsx", "staff_schedules.pdf", "lab_citrix_creds.txt"]}`,
      summary: "AI-generated review: Breach posted on ALPHV ransomware blog. Verified sample data includes active clinic patient names, test profiles, and internal contact information."
    }
  }
];

// 2. Audit Log Records
let audits = [
  {
    timestamp: "2026-06-20 14:30",
    analyst: "Maria Lopez",
    action: "Verified",
    reason: "Evidence contains valid corporate emails and internal documents confirming breach of Apex Fintech Services."
  },
  {
    timestamp: "2026-06-19 09:15",
    analyst: "Alex Chen",
    action: "Verified",
    reason: "GitHub leak repository confirmed hosting active AWS keys. Secret keys rotated by victim since notification."
  },
  {
    timestamp: "2026-06-18 16:45",
    analyst: "Sarah Jenkins",
    action: "Rejected",
    reason: "MOVEit leak files for United Logistics contain strictly public pricing datasheets dated from 2018."
  }
];

// 3. User Profile and Notifications
let activeAnalyst = {
  name: "Maria Lopez",
  email: "",
  role: "Lead Threat Intelligence Analyst",
  clearance: "L3 Admin Access",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
};

let notifications = [
  { id: 1, text: "New threat alert: LockBit 3.0 posted Medix Healthcare", time: "5m ago", unread: true },
  { id: 2, text: "Volt Typhoon critical intelligence report ingested", time: "1h ago", unread: true },
  { id: 3, text: "Exposure check completed for acme.corp", time: "3h ago", unread: false }
];

// 4. Chart References (for destruction on updates)
let chartInstances = {};

// 5. Global State
let currentTab = "landing";
let selectedThreat = threats[0];
let scanLogInterval = null;

// 6. Router and View Control
function navigateTo(tabId, threatId = null) {
  // Check Authentication
  if (tabId !== 'landing' && tabId !== 'login' && !isAuthenticated) {
    tabId = 'login';
  }

  currentTab = tabId;
  
  // Hide all view screens
  document.querySelectorAll('.view-screen').forEach(screen => {
    screen.classList.add('hidden');
    screen.classList.remove('page-fade-in');
  });

  // Handle active page styling in Sidebar
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('bg-slate-800/80', 'text-cyan-400', 'border-l-2', 'border-cyan-400');
      item.classList.remove('text-slate-400', 'hover:bg-slate-900/50', 'hover:text-slate-200');
    } else {
      item.classList.remove('bg-slate-800/80', 'text-cyan-400', 'border-l-2', 'border-cyan-400');
      item.classList.add('text-slate-400', 'hover:bg-slate-900/50', 'hover:text-slate-200');
    }
  });

  // Handle views visibility
  if (tabId === 'landing') {
    document.getElementById('landing-view').classList.remove('hidden');
    document.getElementById('landing-view').classList.add('page-fade-in');
    document.getElementById('app-shell').classList.add('hidden');
    return;
  } else if (tabId === 'login') {
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('login-view').classList.add('page-fade-in');
    return;
  } else {
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
  }

  // Populate dynamic views
  if (tabId === 'dashboard') {
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('page-fade-in');
    renderDashboard();
  } else if (tabId === 'threat-details') {
    document.getElementById('threat-details-view').classList.remove('hidden');
    document.getElementById('threat-details-view').classList.add('page-fade-in');
    if (threatId) {
      selectedThreat = threats.find(t => t.id === threatId) || threats[0];
    }
    renderThreatDetails();
  } else if (tabId === 'exposure-check') {
    document.getElementById('exposure-check-view').classList.remove('hidden');
    document.getElementById('exposure-check-view').classList.add('page-fade-in');
    // Keep or reset scanning screen
  } else if (tabId === 'admin-panel') {
    document.getElementById('admin-panel-view').classList.remove('hidden');
    document.getElementById('admin-panel-view').classList.add('page-fade-in');
    renderAdminPanel();
  } else if (tabId === 'ai-safety') {
    document.getElementById('ai-safety-view').classList.remove('hidden');
    document.getElementById('ai-safety-view').classList.add('page-fade-in');
    renderAISafety();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 7. Initialize Chart.js Elements
function updateCharts() {
  // Chart 1: Threat Activity Over Time
  const ctxActivity = document.getElementById('chart-activity');
  if (ctxActivity) {
    if (chartInstances.activity) chartInstances.activity.destroy();
    
    // Aggregate threats by date
    const dates = ["06-14", "06-15", "06-16", "06-17", "06-18", "06-19", "06-20"];
    const counts = [1, 2, 1, 3, 2, 4, 3]; // mock data corresponding to dates
    
    chartInstances.activity = new Chart(ctxActivity, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Ingested Threats',
          data: counts,
          borderColor: '#22d3ee', // Cyan
          backgroundColor: 'rgba(34, 211, 238, 0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  // Chart 2: Risk Distribution
  const ctxRisk = document.getElementById('chart-risk');
  if (ctxRisk) {
    if (chartInstances.risk) chartInstances.risk.destroy();
    
    // Count status values
    const critical = threats.filter(t => t.status === "Critical").length;
    const high = threats.filter(t => t.status === "High").length;
    const medium = threats.filter(t => t.status === "Medium").length;
    const low = threats.filter(t => t.status === "Low").length;

    chartInstances.risk = new Chart(ctxRisk, {
      type: 'doughnut',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          data: [critical, high, medium, low],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { size: 11 } }
          }
        }
      }
    });
  }

  // Chart 3: Sector Distribution
  const ctxSector = document.getElementById('chart-sector');
  if (ctxSector) {
    if (chartInstances.sector) chartInstances.sector.destroy();
    
    const sectors = ['Healthcare', 'Finance', 'Technology', 'Energy', 'Government'];
    const sectorCounts = sectors.map(sec => threats.filter(t => t.sector === sec).length);

    chartInstances.sector = new Chart(ctxSector, {
      type: 'bar',
      data: {
        labels: sectors,
        datasets: [{
          label: 'Alerts',
          data: sectorCounts,
          backgroundColor: 'rgba(168, 85, 247, 0.65)', // Purple
          borderColor: '#a855f7',
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', stepSize: 1 } }
        }
      }
    });
  }

  // Chart 4: Verification Status Distribution
  const ctxStatus = document.getElementById('chart-status');
  if (ctxStatus) {
    if (chartInstances.status) chartInstances.status.destroy();
    
    const verified = threats.filter(t => t.verificationStatus === "Verified").length;
    const pending = threats.filter(t => t.verificationStatus === "Pending Review").length;
    const rejected = threats.filter(t => t.verificationStatus === "Rejected Incident").length;

    chartInstances.status = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Verified', 'Pending', 'Rejected'],
        datasets: [{
          data: [verified, pending, rejected],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { size: 11 } }
          }
        }
      }
    });
  }
}

// 8. Render Views
function renderDashboard() {
  // Update KPI calculations
  const todayCount = threats.filter(t => t.date === "2026-06-20").length;
  const criticalAlerts = threats.filter(t => t.status === "Critical").length;
  const verifiedLeaks = threats.filter(t => t.verificationStatus === "Verified").length;
  const pendingReviews = threats.filter(t => t.verificationStatus === "Pending Review").length;
  
  // Calculate unique threat actors and sectors
  const actors = new Set(threats.map(t => t.actor)).size;
  const sectors = new Set(threats.map(t => t.sector)).size;

  document.getElementById('kpi-threats-today').innerText = todayCount;
  document.getElementById('kpi-critical').innerText = criticalAlerts;
  document.getElementById('kpi-verified').innerText = verifiedLeaks;
  document.getElementById('kpi-pending').innerText = pendingReviews;
  document.getElementById('kpi-actors').innerText = actors;
  document.getElementById('kpi-sectors').innerText = sectors;

  // Build Threat Feed Table Rows
  const tableBody = document.getElementById('threat-feed-tbody');
  tableBody.innerHTML = "";

  threats.forEach(t => {
    // Risk badges
    let riskBadge = "";
    if (t.status === "Critical") riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/60">${t.status}</span>`;
    else if (t.status === "High") riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-orange-950/80 text-orange-400 border border-orange-800/60">${t.status}</span>`;
    else if (t.status === "Medium") riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950/80 text-yellow-400 border border-yellow-800/60">${t.status}</span>`;
    else riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-green-950/80 text-green-400 border border-green-800/60">${t.status}</span>`;

    // Verification Badges
    let verifyBadge = "";
    if (t.verificationStatus === "Verified") verifyBadge = `<span class="px-2 py-0.5 rounded text-xs font-medium bg-green-950/80 text-green-400 border border-green-800/60">Verified</span>`;
    else if (t.verificationStatus === "Pending Review") verifyBadge = `<span class="px-2 py-0.5 rounded text-xs font-medium bg-yellow-950/80 text-yellow-400 border border-yellow-800/60">Pending Review</span>`;
    else verifyBadge = `<span class="px-2 py-0.5 rounded text-xs font-medium bg-red-950/80 text-red-400 border border-red-800/60">Rejected</span>`;

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/60 cursor-pointer border-b border-slate-800/50 transition-colors";
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">${t.date}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-200">${t.actor}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${t.victim}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">${t.sector}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-center font-mono" style="color: ${t.riskScore > 85 ? '#ef4444' : t.riskScore > 70 ? '#f97316' : '#eab308'}">${t.riskScore}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400 text-center font-mono">${t.confidence}%</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${riskBadge}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${verifyBadge}</td>
    `;
    
    // Add Click listener
    tr.addEventListener('click', () => {
      navigateTo('threat-details', t.id);
    });

    tableBody.appendChild(tr);
  });

  // Force chart update
  updateCharts();
  loadRecentBreachesWidget();
}

async function loadRecentBreachesWidget() {
  const data = await fetchRecentBreaches();
  renderRecentBreachesPanel(data);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderThreatDetails() {
  const t = selectedThreat;
  if (!t) return;

  // Set general details
  document.getElementById('detail-id').innerText = t.id;
  document.getElementById('detail-title-actor').innerText = t.actor;
  document.getElementById('detail-title-victim').innerText = t.victim;
  document.getElementById('detail-actor').innerText = t.actor;
  document.getElementById('detail-victim').innerText = t.victim;
  document.getElementById('detail-sector').innerText = t.sector;
  document.getElementById('detail-country').innerText = t.country;
  document.getElementById('detail-date').innerText = t.date;

  // Scores
  document.getElementById('detail-risk-score').innerText = t.riskScore;
  document.getElementById('detail-confidence-score').innerText = t.confidence;
  
  // Custom styled gauges
  const riskCircle = document.getElementById('detail-risk-gauge');
  const confCircle = document.getElementById('detail-confidence-gauge');
  if (riskCircle) riskCircle.style.width = `${t.riskScore}%`;
  if (confCircle) confCircle.style.width = `${t.confidence}%`;

  // Checklist
  document.getElementById('chk-creds').innerHTML = t.whyCritical.credentialsExposed ? '✓' : '✗';
  document.getElementById('chk-creds').className = t.whyCritical.credentialsExposed ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';
  document.getElementById('chk-financial').innerHTML = t.whyCritical.financialRecordsAffected ? '✓' : '✗';
  document.getElementById('chk-financial').className = t.whyCritical.financialRecordsAffected ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';
  document.getElementById('chk-actor').innerHTML = t.whyCritical.knownRansomwareActor ? '✓' : '✗';
  document.getElementById('chk-actor').className = t.whyCritical.knownRansomwareActor ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';
  document.getElementById('chk-evidence').innerHTML = t.whyCritical.publicEvidenceAvailable ? '✓' : '✗';
  document.getElementById('chk-evidence').className = t.whyCritical.publicEvidenceAvailable ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';

  // Impacts and actions
  document.getElementById('detail-business-impact').innerText = t.businessImpact;
  document.getElementById('detail-technical-impact').innerText = t.technicalImpact;
  document.getElementById('detail-action-immediate').innerText = t.actions.immediate;
  document.getElementById('detail-action-24h').innerText = t.actions.hours24;
  document.getElementById('detail-action-7d').innerText = t.actions.days7;

  // Evidence
  document.getElementById('detail-evidence-source').innerText = t.evidence.source;
  document.getElementById('detail-evidence-extracted').innerText = t.evidence.extracted;
  document.getElementById('detail-evidence-summary').innerText = t.evidence.summary;

  // Dynamic SVG preview instead of missing image
  const svgWrapper = document.getElementById('detail-screenshot-svg');
  if (svgWrapper) {
    svgWrapper.innerHTML = `
      <svg viewBox="0 0 400 200" class="w-full h-full text-slate-800" fill="currentColor">
        <rect width="400" height="200" fill="#090d16" rx="4"></rect>
        <g stroke="#1e293b" stroke-width="1">
          <line x1="0" y1="40" x2="400" y2="40"></line>
          <line x1="0" y1="80" x2="400" y2="80"></line>
          <line x1="0" y1="120" x2="400" y2="120"></line>
          <line x1="0" y1="160" x2="400" y2="160"></line>
          <line x1="80" y1="0" x2="80" y2="200"></line>
          <line x1="160" y1="0" x2="160" y2="200"></line>
          <line x1="240" y1="0" x2="240" y2="200"></line>
          <line x1="320" y1="0" x2="320" y2="200"></line>
        </g>
        <text x="20" y="25" fill="#22d3ee" font-family="monospace" font-size="10">EVIDENCE SOURCE LOGGER [ID: ${t.id}]</text>
        <text x="20" y="65" fill="#f87171" font-family="monospace" font-size="10">> DETECTED KEYWORDS: "EXFILTRATED_DATA", "PASSWORDS_DUMP"</text>
        <text x="20" y="105" fill="#a78bfa" font-family="monospace" font-size="10">> COMPROMISE TIMESTAMP: ${t.date} 08:34:11 GMT</text>
        <text x="20" y="145" fill="#94a3b8" font-family="monospace" font-size="10">> RAW PARSING MATCH: 100% RELIABLE MATCH</text>
        <rect x="260" y="50" width="110" height="110" fill="rgba(34, 211, 238, 0.05)" stroke="#22d3ee" stroke-width="1" rx="4"></rect>
        <circle cx="315" cy="105" r="30" fill="none" stroke="#a855f7" stroke-width="2" class="animate-pulse"></circle>
        <text x="295" y="150" fill="#a855f7" font-family="monospace" font-size="8">BREACH NODE MAP</text>
      </svg>
    `;
  }

  // Banner Verification Status
  const banner = document.getElementById('detail-status-banner');
  banner.innerHTML = "";
  if (t.verificationStatus === "Verified") {
    banner.className = "p-4 rounded-lg bg-green-950/80 border border-green-800/80 text-green-400 flex items-center gap-2";
    banner.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="font-semibold">Verified by LeakGuard Analyst:</span> Incident confirmed active threat status. Mitigations enforced.`;
  } else if (t.verificationStatus === "Pending Review") {
    banner.className = "p-4 rounded-lg bg-yellow-950/80 border border-yellow-800/80 text-yellow-400 flex items-center gap-2";
    banner.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> <span class="font-semibold">Pending Human Review:</span> Ingestion completed. Awaiting analyst audit validation.`;
  } else {
    banner.className = "p-4 rounded-lg bg-red-950/80 border border-red-800/80 text-red-400 flex items-center gap-2";
    banner.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="font-semibold">Rejected Incident:</span> Analyst reviewed and marked as false positive or non-critical legacy information.`;
  }
}

// Global active selection in Admin Queue
let adminActiveId = "";

function renderAdminPanel() {
  const pendingReviews = threats.filter(t => t.verificationStatus === "Pending Review");
  
  // KPI stats
  document.getElementById('admin-kpi-pending').innerText = pendingReviews.length;
  document.getElementById('admin-kpi-verified').innerText = threats.filter(t => t.verificationStatus === "Verified").length;
  document.getElementById('admin-kpi-rejected').innerText = threats.filter(t => t.verificationStatus === "Rejected Incident").length;
  
  // Queue Table
  const tbody = document.getElementById('admin-queue-tbody');
  tbody.innerHTML = "";
  
  const allIncidentsForAdmin = threats; // we show all for convenience, sorting pending first
  const sortedIncidents = [...allIncidentsForAdmin].sort((a, b) => {
    if (a.verificationStatus === "Pending Review" && b.verificationStatus !== "Pending Review") return -1;
    if (a.verificationStatus !== "Pending Review" && b.verificationStatus === "Pending Review") return 1;
    return 0;
  });

  sortedIncidents.forEach(t => {
    let statBadge = "";
    if (t.verificationStatus === "Verified") {
      statBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-green-950/50 text-green-400 border border-green-800/40">Verified</span>`;
    } else if (t.verificationStatus === "Pending Review") {
      statBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950/50 text-yellow-400 border border-yellow-800/40 animate-pulse">Pending</span>`;
    } else {
      statBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-red-950/50 text-red-400 border border-red-800/40">Rejected</span>`;
    }

    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-900/60 cursor-pointer border-b border-slate-800/50 transition-colors ${adminActiveId === t.id ? 'bg-slate-800/40 border-l-2 border-cyan-400' : ''}`;
    tr.innerHTML = `
      <td class="px-4 py-3 whitespace-nowrap text-xs text-slate-400 font-mono">${t.id}</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs text-slate-300 font-semibold">${t.victim}</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs font-bold font-mono text-cyan-400 text-center">${t.riskScore}</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-400 text-center">${t.confidence}%</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs text-center">${statBadge}</td>
    `;
    
    tr.addEventListener('click', () => {
      adminActiveId = t.id;
      renderAdminPanel(); // re-render layout to show active border highlight
      loadAdminEvidenceViewer(t.id);
    });

    tbody.appendChild(tr);
  });

  // Pre-load the first incident if none selected
  if (!adminActiveId && sortedIncidents.length > 0) {
    adminActiveId = sortedIncidents[0].id;
    loadAdminEvidenceViewer(adminActiveId);
  } else if (adminActiveId) {
    loadAdminEvidenceViewer(adminActiveId);
  }

  // Audit Logs
  const auditTbody = document.getElementById('admin-audit-tbody');
  auditTbody.innerHTML = "";
  audits.forEach(a => {
    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/30 text-xs text-slate-400";
    tr.innerHTML = `
      <td class="px-4 py-2 font-mono whitespace-nowrap">${a.timestamp}</td>
      <td class="px-4 py-2 font-medium text-slate-300">${a.analyst}</td>
      <td class="px-4 py-2 font-semibold ${a.action === 'Verified' ? 'text-green-400' : 'text-red-400'}">${a.action}</td>
      <td class="px-4 py-2 italic max-w-xs truncate" title="${a.reason}">${a.reason}</td>
    `;
    auditTbody.appendChild(tr);
  });
}

function loadAdminEvidenceViewer(threatId) {
  const t = threats.find(x => x.id === threatId);
  if (!t) return;

  document.getElementById('admin-ev-id').innerText = t.id;
  document.getElementById('admin-ev-victim').innerText = t.victim;
  document.getElementById('admin-ev-source').innerText = t.evidence.source;
  document.getElementById('admin-ev-extracted').innerText = t.evidence.extracted;
  document.getElementById('admin-ev-summary').innerText = t.evidence.summary;
  document.getElementById('admin-ev-risk').innerText = `${t.riskScore}/100`;
  document.getElementById('admin-ev-conf').innerText = `${t.confidence}%`;
  
  // Set default placeholder for reason
  document.getElementById('admin-verification-reason').value = "";

  // Dynamic review controls enable/disable depending on whether it is already resolved
  const actionContainer = document.getElementById('admin-actions-div');
  if (t.verificationStatus !== "Pending Review") {
    actionContainer.innerHTML = `
      <div class="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-center text-xs text-slate-400">
        This incident was audited and marked as <span class="font-bold text-cyan-400">${t.verificationStatus}</span>. Form submission disabled.
      </div>
    `;
  } else {
    actionContainer.innerHTML = `
      <div class="grid grid-cols-3 gap-2">
        <button type="button" onclick="adminAuditAction('Verified')" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-semibold rounded text-xs">Verify Leak</button>
        <button type="button" onclick="adminAuditAction('Rejected Incident')" class="px-3 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-semibold rounded text-xs">Reject Leak</button>
        <button type="button" onclick="adminAuditAction('Request Evidence')" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-slate-200 font-semibold rounded text-xs">Request Info</button>
      </div>
    `;
  }
}

function adminAuditAction(actionState) {
  const reasonText = document.getElementById('admin-verification-reason').value.trim();
  if (!reasonText) {
    showToast("Please enter a validation rationale or reason.", "error");
    return;
  }

  // Find incident
  const incidentIdx = threats.findIndex(t => t.id === adminActiveId);
  if (incidentIdx === -1) return;

  // Update Status
  let actionLogged = "Verified";
  if (actionState === "Verified") {
    threats[incidentIdx].verificationStatus = "Verified";
    actionLogged = "Verified";
  } else if (actionState === "Rejected Incident") {
    threats[incidentIdx].verificationStatus = "Rejected Incident";
    actionLogged = "Rejected";
  } else {
    threats[incidentIdx].verificationStatus = "Pending Review";
    actionLogged = "Info Requested";
  }

  // Create audit log entry
  const now = new Date();
  const formatTime = now.getFullYear() + "-" + 
                     String(now.getMonth()+1).padStart(2, '0') + "-" + 
                     String(now.getDate()).padStart(2, '0') + " " + 
                     String(now.getHours()).padStart(2, '0') + ":" + 
                     String(now.getMinutes()).padStart(2, '0');

  const newAudit = {
    timestamp: formatTime,
    analyst: activeAnalyst.name,
    action: actionLogged,
    reason: reasonText
  };

  audits.unshift(newAudit); // add to top
  
  // Show notification
  showToast(`Incident ${adminActiveId} audited successfully as: ${actionLogged}`, "success");

  // Re-render
  renderAdminPanel();
  
  // Add dynamic notification
  notifications.unshift({
    id: Date.now(),
    text: `Incident ${adminActiveId} verification updated by ${activeAnalyst.name}`,
    time: "Just now",
    unread: true
  });
  renderNotifications();
}

function renderAISafety() {
  // Aggregate accuracy metrics
  const verified = threats.filter(t => t.verificationStatus === "Verified").length;
  const rejected = threats.filter(t => t.verificationStatus === "Rejected Incident").length;
  const totalAudited = verified + rejected;

  // False positive calculation (how many rejected out of audited)
  const fpRate = totalAudited > 0 ? ((rejected / totalAudited) * 100).toFixed(1) : "0.0";
  const verificationRate = threats.length > 0 ? (((threats.length - threats.filter(t => t.verificationStatus === "Pending Review").length) / threats.length) * 100).toFixed(1) : "0.0";

  document.getElementById('safety-verification-rate').innerText = `${verificationRate}%`;
  document.getElementById('safety-false-positive').innerText = `${fpRate}%`;
  
  // Average confidence calculations
  const avgConf = (threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length).toFixed(1);
  document.getElementById('safety-avg-confidence').innerText = `${avgConf}%`;
}

// 9. Exposure Checker — LeakOsint integration with censored output
let exposureSearchMode = 'domain';

const OSINT_FIELD_MAP = {
  email: ['Email', 'email', 'Mail', 'mail', 'E-mail', 'Correo', 'correo', 'Login', 'login', 'Username', 'username', 'User', 'user'],
  password: ['Password', 'password', 'Pass', 'pass', 'Passwd', 'pwd', 'Contraseña', 'contraseña', 'ContraseñaHash'],
  hash: ['Hash', 'hash', 'PasswordHash', 'password_hash', 'PassHash'],
  phone: ['Phone', 'phone', 'Tel', 'tel', 'Telefono', 'telefono', 'Mobile', 'mobile'],
  name: ['Name', 'name', 'Nombre', 'nombre', 'FullName', 'full_name']
};

function setExposureSearchMode(mode) {
  exposureSearchMode = mode;
  document.querySelectorAll('.exp-mode-btn').forEach(btn => {
    btn.classList.remove('border-cyan-500/50', 'bg-cyan-950/30', 'text-cyan-400');
    btn.classList.add('border-slate-800', 'text-slate-400');
  });
  const active = document.getElementById(`exp-mode-${mode}`);
  if (active) {
    active.classList.add('border-cyan-500/50', 'bg-cyan-950/30', 'text-cyan-400');
    active.classList.remove('border-slate-800', 'text-slate-400');
  }
  const input = document.getElementById('exposure-domain-input');
  const placeholders = {
    domain: 'Dominio corporativo (ej. policia.bo, empresa.com)',
    email: 'Correo electrónico (ej. analista@empresa.com)',
    phone: 'Número telefónico (ej. +59171234567)'
  };
  if (input) input.placeholder = placeholders[mode] || placeholders.domain;
}

function censorPassword(value) {
  if (!value || typeof value !== 'string') return '[oculto]';
  const v = value.trim();
  if (!v) return '[oculto]';
  if (v.startsWith('$2') || v.startsWith('$6') || /^sha\d/i.test(v) || v.length > 48) {
    return censorHash(v);
  }
  if (v.length <= 3) return '••••';
  const start = v.slice(0, 2);
  const end = v.slice(-2);
  const hidden = Math.max(4, v.length - 4);
  return `${start}${'•'.repeat(hidden)}${end}`;
}

function censorHash(value) {
  if (!value) return '[hash oculto]';
  const v = String(value).trim();
  if (v.length <= 10) return `${v.slice(0, 3)}••••`;
  return `${v.slice(0, 8)}••••••`;
}

function censorEmail(value) {
  if (!value || typeof value !== 'string' || !value.includes('@')) return value || '[oculto]';
  const [user, domain] = value.split('@');
  if (!user) return `***@${domain}`;
  const visible = user.slice(0, Math.min(3, user.length));
  const masked = '*'.repeat(Math.max(2, user.length - visible.length));
  return `${visible}${masked}@${domain}`;
}

function censorPhone(value) {
  if (!value) return '[oculto]';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length < 6) return '••••••';
  return `${digits.slice(0, 3)}••••${digits.slice(-2)}`;
}

function censorGeneric(value) {
  if (!value || typeof value !== 'string') return '[oculto]';
  const v = value.trim();
  if (v.length <= 4) return '••••';
  return `${v.slice(0, 2)}${'•'.repeat(Math.max(3, v.length - 4))}${v.slice(-2)}`;
}

function pickField(entry, keys) {
  for (const key of keys) {
    if (entry[key] !== undefined && entry[key] !== null && String(entry[key]).trim() !== '') {
      return String(entry[key]).trim();
    }
  }
  return null;
}

function normalizeOsintEntry(entry) {
  return {
    email: pickField(entry, OSINT_FIELD_MAP.email),
    password: pickField(entry, OSINT_FIELD_MAP.password),
    hash: pickField(entry, OSINT_FIELD_MAP.hash),
    phone: pickField(entry, OSINT_FIELD_MAP.phone),
    name: pickField(entry, OSINT_FIELD_MAP.name),
    raw: entry
  };
}

function buildIndicatorsHtml(normalized) {
  const parts = [];
  if (normalized.email) {
    parts.push(`Email: <span class="font-mono text-cyan-300">${censorEmail(normalized.email)}</span>`);
  }
  if (normalized.password) {
    parts.push(`Contraseña: <span class="font-mono text-red-400">${censorPassword(normalized.password)}</span>`);
  } else if (normalized.hash) {
    parts.push(`Hash: <span class="font-mono text-purple-300">${censorHash(normalized.hash)}</span>`);
  }
  if (normalized.phone) {
    parts.push(`Teléfono: <span class="font-mono text-cyan-300">${censorPhone(normalized.phone)}</span>`);
  }
  if (normalized.name) {
    parts.push(`Nombre: <span class="font-mono text-slate-300">${censorGeneric(normalized.name)}</span>`);
  }
  if (parts.length === 0) {
    const extras = Object.entries(normalized.raw || {})
      .filter(([k, v]) => v && typeof v === 'string' && !['InfoLeak'].includes(k))
      .slice(0, 3)
      .map(([k, v]) => `${k}: <span class="font-mono text-slate-300">${censorGeneric(String(v))}</span>`);
    if (extras.length) return extras.join(' | ');
    return 'Registro indexado (datos sensibles ocultos)';
  }
  return parts.join(' | ');
}

function severityFromRecord(normalized) {
  if (normalized.password && !normalized.hash) return { label: 'Critical', className: 'text-red-400' };
  if (normalized.hash || normalized.password) return { label: 'High', className: 'text-orange-400' };
  if (normalized.email || normalized.phone) return { label: 'Medium', className: 'text-yellow-500' };
  return { label: 'Low', className: 'text-slate-400' };
}

function parseOsintResponse(data) {
  const records = [];
  const stats = {
    totalLogins: 0,
    totalDatabases: 0,
    databasesWithHits: 0,
    plaintextPasswords: 0,
    hashedPasswords: 0,
    apiTotalResults: null,
    apiNumDatabases: null,
    fromApi: true
  };

  if (!data || typeof data !== 'object') return { records, stats };

  stats.apiTotalResults = data.NumOfResults ?? data.numOfResults ?? data.NumResults ?? null;
  stats.apiNumDatabases = data.NumOfDatabase ?? data.numOfDatabase ?? data.NumDatabase ?? null;

  const list = data.List || data.list || data.results || {};
  if (typeof list !== 'object') return { records, stats };

  let sumReportedResults = 0;

  for (const [sourceName, sourceData] of Object.entries(list)) {
    if (!sourceData || typeof sourceData !== 'object') continue;

    stats.totalDatabases++;
    const entries = sourceData.Data || sourceData.data || sourceData.records || [];
    const dbResultCount = Number(sourceData.NumOfResults ?? sourceData.numOfResults ?? 0);
    if (dbResultCount > 0) sumReportedResults += dbResultCount;
    const infoLeak = sourceData.InfoLeak || sourceData.info || sourceName;
    const title = typeof infoLeak === 'string' && infoLeak.length > 3 ? infoLeak : sourceName;

    if (Array.isArray(entries) && entries.length > 0) {
      stats.databasesWithHits++;
      stats.totalLogins += entries.length;
      if (!dbResultCount) sumReportedResults += entries.length;

      entries.forEach(entry => {
        const normalized = normalizeOsintEntry(entry);
        const severity = severityFromRecord(normalized);

        if (normalized.password) {
          if (normalized.password.startsWith('$') || /^sha/i.test(normalized.password) || normalized.password.length > 48) {
            stats.hashedPasswords++;
          } else {
            stats.plaintextPasswords++;
          }
        } else if (normalized.hash) {
          stats.hashedPasswords++;
        }

        const loginDisplay = normalized.email
          ? censorEmail(normalized.email)
          : normalized.phone
            ? censorPhone(normalized.phone)
            : normalized.name
              ? censorGeneric(normalized.name)
              : '—';

        const credDisplay = normalized.password
          ? `<span class="font-mono text-red-400">${censorPassword(normalized.password)}</span>`
          : normalized.hash
            ? `<span class="font-mono text-purple-300">${censorHash(normalized.hash)}</span>`
            : '<span class="text-slate-600">—</span>';

        records.push({
          date: sourceData.LastUpdate || sourceData.Date || sourceData.date || '—',
          title: title.length > 80 ? `${title.slice(0, 77)}...` : title,
          sourceName,
          login: loginDisplay,
          credentialHtml: credDisplay,
          severity: severity.label,
          severityClass: severity.className,
          normalized,
          indicatorsHtml: buildIndicatorsHtml(normalized)
        });
      });
    } else if (sourceData.InfoLeak) {
      stats.databasesWithHits++;
      records.push({
        date: '—',
        title: sourceName,
        sourceName,
        login: '—',
        credentialHtml: '<span class="text-slate-600">—</span>',
        severity: 'Medium',
        severityClass: 'text-yellow-500',
        indicatorsHtml: `<span class="text-slate-400">${String(sourceData.InfoLeak).slice(0, 120)}</span>`
      });
    }
  }

  if (stats.apiTotalResults === null && sumReportedResults > 0) {
    stats.apiTotalResults = sumReportedResults;
  }
  if (stats.apiTotalResults === null) {
    stats.apiTotalResults = stats.totalLogins;
  }
  if (stats.apiNumDatabases === null) {
    stats.apiNumDatabases = stats.databasesWithHits;
  }

  // Si la API reporta más resultados que filas devueltas, conservar el total real
  stats.recordsReturned = records.length;

  return { records, stats };
}

function detectSearchType(query) {
  if (exposureSearchMode === 'email' || query.includes('@')) {
    return 'Correo Electrónico (Email)';
  }
  if (exposureSearchMode === 'phone' || /^\+?[0-9\-\s().]{7,20}$/.test(query)) {
    return 'Número Telefónico';
  }
  if (exposureSearchMode === 'domain' || query.includes('.')) {
    return 'Dominio Corporativo';
  }
  return 'Consulta General';
}

// ==========================================
// Account breach alerts & free OSINT (XposedOrNot via proxy)
// ==========================================
async function queryFreeBreachApi(email) {
  const response = await fetch('/api/breach-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() })
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data && data.error) || 'Servicio OSINT gratuito no disponible');
  }
  return data;
}

function parseBreachCheckResponse(data) {
  const result = {
    exposed: false,
    breachCount: 0,
    breaches: [],
    riskScore: null,
    email: null,
    source: 'xposedornot'
  };

  if (!data || !data.check) return result;

  const check = data.check;
  if (check.Error === 'Not found' || !check.breaches) {
    result.email = check.email || null;
    return result;
  }

  const flat = Array.isArray(check.breaches[0]) ? check.breaches[0] : check.breaches.flat();
  result.breaches = flat.filter(Boolean);
  result.breachCount = result.breaches.length;
  result.exposed = result.breachCount > 0;
  result.email = check.email || null;

  if (data.analytics && data.analytics.BreachMetrics) {
    const metrics = data.analytics.BreachMetrics;
    if (metrics.risk_score !== undefined) result.riskScore = metrics.risk_score;
    else if (metrics.risk && metrics.risk[0] !== undefined) result.riskScore = metrics.risk[0];
  }

  return result;
}

function pushAccountNotification(text, unread = true, category = 'account-breach') {
  notifications.unshift({
    id: Date.now() + Math.random(),
    text,
    time: 'Ahora',
    unread,
    category
  });
  renderNotifications();
}

async function runAccountBreachAlert(email, context) {
  if (!email || !email.includes('@')) return;

  try {
    const raw = await queryFreeBreachApi(email);
    const parsed = parseBreachCheckResponse(raw);
    const censored = censorEmail(email);
    const isRegister = context === 'register';

    if (parsed.exposed) {
      const sample = parsed.breaches.slice(0, 4).join(', ');
      const extra = parsed.breachCount > 4 ? ` (+${parsed.breachCount - 4} más)` : '';
      const riskNote = parsed.riskScore !== null ? ` · Riesgo XON: ${parsed.riskScore}` : '';

      pushAccountNotification(
        `⚠️ ${isRegister ? 'Bienvenido' : 'Alerta de sesión'}: ${censored} aparece en ${parsed.breachCount} filtración(es) — ${sample}${extra}${riskNote}`,
        true
      );
      showToast(`Tu correo tiene ${parsed.breachCount} filtración(es) conocidas. Revisa notificaciones.`, 'error');
    } else {
      pushAccountNotification(
        `✓ ${isRegister ? 'Registro seguro' : 'Sesión verificada'}: ${censored} no aparece en el índice público XposedOrNot.`,
        true
      );
      showToast('Tu correo no aparece en filtraciones públicas conocidas', 'success');
    }
  } catch (err) {
    pushAccountNotification(
      `ℹ️ No se pudo verificar filtraciones para ${censorEmail(email)} (${err.message}).`,
      true
    );
  }
}

function mergeXonIntoExposureRecords(records, stats, xonParsed, email) {
  if (!xonParsed || !xonParsed.exposed) return { records, stats };

  const existingTitles = new Set(records.map(r => r.title.toLowerCase()));
  let added = 0;

  xonParsed.breaches.forEach(breachName => {
    const title = `${breachName} [OSINT Gratuito]`;
    if (existingTitles.has(title.toLowerCase()) || existingTitles.has(breachName.toLowerCase())) return;

    records.push({
      date: '—',
      title,
      sourceName: breachName,
      login: censorEmail(email),
      credentialHtml: '<span class="text-[10px] text-purple-400 font-mono">Índice XposedOrNot</span>',
      severity: 'High',
      severityClass: 'text-orange-400',
      source: 'xposedornot'
    });
    added++;
  });

  if (added > 0) {
    stats.databasesWithHits = (stats.databasesWithHits || 0) + added;
    stats.apiTotalResults = (stats.apiTotalResults || records.length - added) + added;
    stats.totalLogins = (stats.totalLogins || 0) + added;
    stats.xonBreaches = xonParsed.breachCount;
  }

  return { records, stats };
}

async function fetchRecentBreaches() {
  try {
    const res = await fetch('/api/breaches-recent');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function renderRecentBreachesPanel(data) {
  const container = document.getElementById('recent-breaches-list');
  if (!container) return;

  if (!data) {
    container.innerHTML = '<p class="text-xs text-slate-500">Índice OSINT gratuito no disponible.</p>';
    return;
  }

  let list = [];
  if (Array.isArray(data.breaches)) {
    list = data.breaches;
  } else if (Array.isArray(data.breaches?.exposedBreaches)) {
    list = data.breaches.exposedBreaches;
  } else if (Array.isArray(data.exposedBreaches)) {
    list = data.exposedBreaches;
  }

  list = list
    .slice()
    .sort((a, b) => new Date(b.addedDate || b.breachedDate || 0) - new Date(a.addedDate || a.breachedDate || 0))
    .slice(0, 10);

  if (!list.length) {
    container.innerHTML = '<p class="text-xs text-slate-500">Sin datos de filtraciones recientes.</p>';
    return;
  }

  container.innerHTML = list.map(item => {
    const name = item.breachID || item.breach_name || '—';
    const year = (item.breachedDate || item.breach_date || '—').slice(0, 10);
    const records = item.exposedRecords ? `${(item.exposedRecords / 1e6).toFixed(1)}M reg.` : '';
    return `
      <div class="flex justify-between items-center gap-2 py-2 border-b border-slate-800/40 text-xs">
        <div class="min-w-0">
          <span class="text-slate-300 font-medium block truncate" title="${name}">${name}</span>
          ${records ? `<span class="text-[10px] text-slate-500">${records}</span>` : ''}
        </div>
        <span class="text-slate-500 font-mono whitespace-nowrap">${year}</span>
      </div>`;
  }).join('');
}

async function queryOsintApi(request) {
  const payload = { request: request.trim(), limit: 500, lang: 'es' };

  let response;
  try {
    response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error('No se pudo conectar con el servicio de escaneo. Ejecuta el servidor local (proxy/) o despliega Firebase Functions.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = (data && data.error) ? data.error : `Error del servicio (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

function calculateRealRiskPercent(stats, records) {
  if (!records.length) {
    return { score: 0, level: 'Sin Riesgo', levelClass: 'text-green-400', barColor: '#22c55e' };
  }

  const loginCount = stats.apiTotalResults || stats.totalLogins || records.length;
  const dbCount = stats.databasesWithHits || stats.apiNumDatabases || 1;
  const plaintext = stats.plaintextPasswords || 0;
  const hashed = stats.hashedPasswords || 0;

  let score = 0;
  score += Math.min(35, Math.log10(loginCount + 1) * 15);
  score += Math.min(25, dbCount * 4);
  score += Math.min(30, plaintext * 6);
  score += Math.min(12, hashed * 2);

  if (loginCount >= 50) score = Math.max(score, 85);
  else if (loginCount >= 20) score = Math.max(score, 70);
  else if (loginCount >= 5) score = Math.max(score, 55);
  if (plaintext >= 3) score = Math.max(score, 78);

  score = Math.round(Math.min(99, Math.max(8, score)));

  let level, levelClass, barColor;
  if (score >= 80) {
    level = 'Crítico';
    levelClass = 'text-red-400';
    barColor = '#ef4444';
  } else if (score >= 60) {
    level = 'Alto';
    levelClass = 'text-orange-400';
    barColor = '#f97316';
  } else if (score >= 35) {
    level = 'Moderado';
    levelClass = 'text-yellow-500';
    barColor = '#eab308';
  } else {
    level = 'Bajo';
    levelClass = 'text-green-400';
    barColor = '#22c55e';
  }

  return { score, level, levelClass, barColor };
}

function generateExposureRecommendations(query, searchType, stats, risk) {
  const recs = [];
  const loginCount = stats.apiTotalResults || stats.totalLogins || 0;
  const hasPlaintext = stats.plaintextPasswords > 0;

  if (risk.score >= 70 || hasPlaintext) {
    recs.push({
      priority: 'Inmediato',
      color: 'red',
      items: [
        'Cambiar todas las contraseñas asociadas a este activo de forma inmediata.',
        hasPlaintext
          ? `Se detectaron ${stats.plaintextPasswords} contraseña(s) en texto claro — asumir compromiso total.`
          : 'Rotar credenciales en todos los servicios donde se haya reutilizado esta cuenta.',
        'Activar autenticación multifactor (MFA) en cuentas críticas vinculadas.'
      ]
    });
  }

  if (loginCount >= 3 || stats.databasesWithHits >= 2) {
    recs.push({
      priority: '24 Horas',
      color: 'orange',
      items: [
        `Revisar ${stats.databasesWithHits} base(s) de filtración indexada(s) para identificar servicios afectados.`,
        'Auditar inicios de sesión recientes y cerrar sesiones activas sospechosas.',
        'Verificar si el correo aparece en listas de spam/phishing dirigido (spear phishing).'
      ]
    });
  }

  recs.push({
    priority: '7 Días',
    color: 'yellow',
    items: searchType === 'Correo Electrónico (Email)'
      ? [
          'Implementar un gestor de contraseñas y eliminar reutilización de credenciales.',
          'Monitorear alertas de Have I Been Pwned y fuentes OSINT periódicamente.',
          'Capacitar al usuario sobre phishing y suplantación de identidad.'
        ]
      : searchType === 'Dominio Corporativo'
        ? [
            'Forzar reset de contraseñas corporativas para cuentas expuestas detectadas.',
            'Desplegar escaneo continuo de credenciales en repos dark web.',
            'Revisar políticas de acceso externo (VPN, RDP, portales web).'
          ]
        : [
            'Validar titularidad del número y bloquear SIM swap no autorizado.',
            'No compartir códigos OTP recibidos por SMS con terceros.',
            'Considerar migrar verificación 2FA a app autenticadora en lugar de SMS.'
          ]
  });

  if (risk.score < 35) {
    recs.unshift({
      priority: 'Preventivo',
      color: 'cyan',
      items: [
        'Exposición limitada detectada — mantener monitoreo periódico.',
        'Aplicar contraseñas únicas y MFA como medida preventiva.',
        `Consulta "${query}" sin filtraciones críticas en el índice actual.`
      ]
    });
  }

  return recs.slice(0, 3);
}

function renderExposureStats(stats, records) {
  const totalLogins = stats.apiTotalResults ?? stats.totalLogins ?? records.length;
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  set('exp-stat-logins', totalLogins);
  set('exp-stat-databases', stats.databasesWithHits ?? stats.apiNumDatabases ?? 0);
  set('exp-stat-plaintext', stats.plaintextPasswords ?? 0);
  set('exp-stat-api-total', totalLogins);
}

function renderExposureRecommendations(recs) {
  const container = document.getElementById('exp-recommendations');
  if (!container) return;

  const colorMap = {
    red: { bg: 'bg-red-950/20', border: 'border-red-900/30', title: 'text-red-400' },
    orange: { bg: 'bg-orange-950/20', border: 'border-orange-900/30', title: 'text-orange-400' },
    yellow: { bg: 'bg-yellow-950/20', border: 'border-yellow-900/30', title: 'text-yellow-400' },
    cyan: { bg: 'bg-cyan-950/20', border: 'border-cyan-900/30', title: 'text-cyan-400' }
  };

  container.innerHTML = recs.map(rec => {
    const c = colorMap[rec.color] || colorMap.cyan;
    return `
      <div class="p-4 rounded-lg ${c.bg} border ${c.border} space-y-2">
        <div class="text-xs font-bold ${c.title} uppercase tracking-wider">${rec.priority}</div>
        <ul class="space-y-1.5 text-xs text-slate-300 leading-relaxed list-disc list-inside">
          ${rec.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>`;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderExposureRecords(records, query, stats) {
  const tableIncidents = document.getElementById('exp-incidents-tbody');
  const badge = document.getElementById('exp-records-badge');
  const footer = document.getElementById('exp-records-footer');
  const totalCount = stats.apiTotalResults ?? records.length;
  const returnedCount = records.length;

  tableIncidents.innerHTML = '';

  if (badge) {
    badge.innerText = `${totalCount} filtración(es) indexada(s) · ${stats.databasesWithHits ?? 0} base(s) · ${returnedCount} fila(s) mostradas`;
  }

  if (!records.length) {
    tableIncidents.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-xs text-slate-500">
          Ningún registro de filtración encontrado para <span class="font-mono text-slate-400">${query}</span>.
        </td>
      </tr>`;
    if (footer) footer.innerText = '';
    return;
  }

  records.forEach((record, index) => {
    const tr = document.createElement('tr');
    tr.className = index < returnedCount - 1 ? 'border-b border-slate-800/50 hover:bg-slate-900/40' : 'hover:bg-slate-900/40';
    tr.innerHTML = `
      <td class="px-4 py-2 font-mono text-xs text-slate-400 whitespace-nowrap">${record.date}</td>
      <td class="px-4 py-2 text-xs font-semibold text-slate-200 max-w-[180px]">${record.title}</td>
      <td class="px-4 py-2 text-xs font-mono text-cyan-300">${record.login || '—'}</td>
      <td class="px-4 py-2 text-xs">${record.credentialHtml || '—'}</td>
      <td class="px-4 py-2 text-xs font-bold ${record.severityClass} whitespace-nowrap">${record.severity}</td>`;
    tableIncidents.appendChild(tr);
  });

  if (footer) {
    if (totalCount > returnedCount) {
      footer.innerText = `Total reportado por el índice: ${totalCount} · Registros recuperados en esta consulta: ${returnedCount} · Bases afectadas: ${stats.databasesWithHits ?? 0}`;
    } else {
      footer.innerText = `${returnedCount} login(s) / credencial(es) en ${stats.databasesWithHits ?? 0} base(s) de filtración`;
    }
  }
}

function renderExposureChart(score) {
  const ctxTrend = document.getElementById('chart-exposure-trend');
  if (!ctxTrend) return;
  if (chartInstances.exposureTrend) chartInstances.exposureTrend.destroy();
  chartInstances.exposureTrend = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Actual'],
      datasets: [{
        label: 'Historial de Riesgo',
        data: score > 50 ? [20, 35, 68, 55, score] : [10, 15, 12, 24, score],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        borderWidth: 1.5,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

function appendExposureLog(logConsole, message, highlight = false) {
  const p = document.createElement('p');
  p.className = `text-xs font-mono mb-1 ${highlight ? 'text-green-400 font-bold' : 'text-slate-400'}`;
  p.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
  logConsole.appendChild(p);
  logConsole.scrollTop = logConsole.scrollHeight;
}

async function animateExposureLogs(logConsole, query, searchType) {
  const steps = [
    `Iniciando secuencia de análisis de vulnerabilidades para: ${query}`,
    `[+] Detectado tipo de consulta: ${searchType}`,
    `[+] Preparando consulta segura (lang: es, limit: 500)...`,
    `[+] Autenticación con servicio de escaneo [credenciales: ********]`,
    `[+] Consultando motor de indexación de filtraciones...`,
    `[+] Buscando coincidencias en bases de filtraciones...`,
    `[+] Sanitizando y censurando credenciales expuestas...`
  ];

  for (let i = 0; i < steps.length; i++) {
    appendExposureLog(logConsole, steps[i]);
    await new Promise(resolve => setTimeout(resolve, 380));
  }
}

async function runExposureCheck() {
  const domainInput = document.getElementById('exposure-domain-input').value.trim();
  if (!domainInput) {
    showToast('Introduce un criterio de búsqueda (correo, dominio o teléfono)', 'error');
    return;
  }

  const logConsole = document.getElementById('exposure-scan-log');
  const resultsCard = document.getElementById('exposure-results');
  const scanBtn = document.getElementById('exposure-scan-btn');

  logConsole.innerHTML = '';
  logConsole.classList.remove('hidden');
  resultsCard.classList.add('hidden');

  if (scanLogInterval) clearInterval(scanLogInterval);

  const searchType = detectSearchType(domainInput);
  scanBtn.disabled = true;
  scanBtn.classList.add('opacity-60', 'cursor-not-allowed');

  await animateExposureLogs(logConsole, domainInput, searchType);

  let records = [];
  let stats = {
    totalLogins: 0,
    totalDatabases: 0,
    databasesWithHits: 0,
    plaintextPasswords: 0,
    hashedPasswords: 0,
    apiTotalResults: null,
    apiNumDatabases: null,
    recordsReturned: 0,
    fromApi: false
  };

  try {
    const isEmailQuery = searchType === 'Correo Electrónico (Email)' || domainInput.includes('@');
    const apiPromises = [queryOsintApi(domainInput)];
    if (isEmailQuery) {
      apiPromises.push(queryFreeBreachApi(domainInput).catch(() => null));
    }

    const [apiData, xonRaw] = await Promise.all(apiPromises);
    const parsed = parseOsintResponse(apiData);
    records = parsed.records;
    stats = parsed.stats;
    stats.fromApi = true;

    if (xonRaw) {
      const xonParsed = parseBreachCheckResponse(xonRaw);
      const merged = mergeXonIntoExposureRecords(records, stats, xonParsed, domainInput);
      records = merged.records;
      stats = merged.stats;
      appendExposureLog(logConsole, `[+] OSINT gratuito (XposedOrNot): ${xonParsed.breachCount} filtración(es) adicionales.`);
    }

    const total = stats.apiTotalResults ?? records.length;
    appendExposureLog(logConsole, `[+] Índice: ${total} resultado(s) · ${stats.databasesWithHits} base(s) · ${records.length} registro(s) parseados.`);
  } catch (err) {
    appendExposureLog(logConsole, `[!] Error: ${err.message}`, true);
    showToast(err.message, 'error');
    scanBtn.disabled = false;
    scanBtn.classList.remove('opacity-60', 'cursor-not-allowed');
    return;
  }

  if (!records.length) {
    appendExposureLog(logConsole, `[+] Sin coincidencias en el índice para este criterio.`, true);
  }

  const risk = calculateRealRiskPercent(stats, records);
  const recommendations = generateExposureRecommendations(domainInput, searchType, stats, risk);

  const trend = risk.score > 50 ? 'Actividad de Amenazas en Alza' : 'Actividad de Amenazas Estable';
  const trendColor = risk.score > 50 ? 'text-red-400' : 'text-green-400';
  const totalLogins = stats.apiTotalResults ?? records.length;

  document.getElementById('exp-res-domain').innerText = domainInput;
  document.getElementById('exp-res-score').innerText = risk.score;
  document.getElementById('exp-res-score').style.color = risk.barColor;
  document.getElementById('exp-res-risk-level').innerText = `Nivel: ${risk.level}`;
  document.getElementById('exp-res-risk-level').className = `text-xs font-semibold mt-1 uppercase tracking-wider ${risk.levelClass}`;

  const riskBar = document.getElementById('exp-res-risk-bar');
  if (riskBar) {
    riskBar.style.width = `${risk.score}%`;
    riskBar.style.backgroundColor = risk.barColor;
  }

  document.getElementById('exp-res-trend').innerText = trend;
  document.getElementById('exp-res-trend').className = `text-xs font-semibold ${trendColor}`;
  document.getElementById('exp-res-lastseen').innerText = records.length
    ? `${totalLogins} exposición(es) indexada(s) en ${stats.databasesWithHits ?? 0} filtración(es)`
    : 'Sin filtraciones detectadas';

  document.getElementById('exp-res-search-type').innerText = searchType;
  document.getElementById('exp-res-data-source').innerText = 'Motor OSINT + XposedOrNot (gratuito)';
  document.getElementById('exp-res-shown-count').innerText =
    `${records.length} registro(s) mostrados · total índice: ${totalLogins}`;

  renderExposureStats(stats, records);
  renderExposureRecommendations(recommendations);
  renderExposureRecords(records, domainInput, stats);
  appendExposureLog(logConsole, `Análisis finalizado. Riesgo: ${risk.score}% · Total índice: ${totalLogins} · Mostrados: ${records.length}.`, true);

  resultsCard.classList.remove('hidden');
  resultsCard.classList.add('page-fade-in');
  renderExposureChart(risk.score);

  scanBtn.disabled = false;
  scanBtn.classList.remove('opacity-60', 'cursor-not-allowed');
}

// 10. Global Search Event Handler
function executeGlobalSearch() {
  const query = document.getElementById('global-search').value.toLowerCase().trim();
  const searchResultsDiv = document.getElementById('search-dropdown');

  if (!query) {
    searchResultsDiv.classList.add('hidden');
    return;
  }

  // Filter threats
  const filtered = threats.filter(t => 
    t.actor.toLowerCase().includes(query) || 
    t.victim.toLowerCase().includes(query) || 
    t.sector.toLowerCase().includes(query) || 
    t.id.toLowerCase().includes(query)
  );

  searchResultsDiv.innerHTML = "";
  if (filtered.length > 0) {
    filtered.forEach(f => {
      const d = document.createElement('div');
      d.className = "p-2 hover:bg-slate-800 text-xs cursor-pointer flex justify-between items-center text-slate-300 border-b border-slate-800/50";
      d.innerHTML = `
        <div>
          <span class="font-semibold text-slate-100">${f.actor}</span> <span class="text-slate-500">-></span> ${f.victim}
        </div>
        <span class="text-[10px] font-mono px-1 rounded bg-slate-900 text-cyan-400">${f.status}</span>
      `;
      d.addEventListener('click', () => {
        navigateTo('threat-details', f.id);
        document.getElementById('global-search').value = "";
        searchResultsDiv.classList.add('hidden');
      });
      searchResultsDiv.appendChild(d);
    });
    searchResultsDiv.classList.remove('hidden');
  } else {
    searchResultsDiv.innerHTML = `<div class="p-3 text-center text-xs text-slate-500">No threat match found</div>`;
    searchResultsDiv.classList.remove('hidden');
  }
}

// 11. Notification Dropdown Toggle
function toggleNotificationCenter() {
  const div = document.getElementById('notification-dropdown-menu');
  div.classList.toggle('hidden');
}

function renderNotifications() {
  const badge = document.getElementById('notification-badge');
  const count = notifications.filter(n => n.unread).length;
  
  if (count > 0) {
    badge.innerText = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  const wrapper = document.getElementById('notifications-list-container');
  wrapper.innerHTML = "";
  notifications.forEach(n => {
    const item = document.createElement('div');
    const isBreach = n.category === 'account-breach';
    item.className = `p-3 text-xs border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors cursor-pointer ${n.unread ? 'bg-slate-900/30' : ''} ${isBreach && n.text.startsWith('⚠️') ? 'border-l-2 border-red-500/60' : isBreach ? 'border-l-2 border-emerald-500/40' : ''}`;
    item.innerHTML = `
      <div class="flex justify-between items-start mb-1">
        <span class="font-medium text-slate-200">${n.text}</span>
        <span class="text-[10px] text-slate-500 whitespace-nowrap">${n.time}</span>
      </div>
    `;
    // Click mark read
    item.addEventListener('click', () => {
      n.unread = false;
      renderNotifications();
    });
    wrapper.appendChild(item);
  });
}

// 12. Toast Feedback Generator
function showToast(message, type = "success") {
  const wrapper = document.getElementById('toast-wrapper');
  const toast = document.createElement('div');
  
  let typeClasses = "bg-slate-900 border-emerald-500/50 text-emerald-400 glow-cyan";
  if (type === "error") {
    typeClasses = "bg-slate-900 border-red-500/50 text-red-400 glow-red";
  }

  toast.className = `flex items-center gap-3 p-4 rounded-lg border shadow-lg text-sm max-w-sm ${typeClasses} page-fade-in`;
  toast.innerHTML = `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <div class="font-medium">${message}</div>
  `;

  wrapper.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Close Dropdowns on Click Outside
document.addEventListener('click', (e) => {
  const searchInput = document.getElementById('global-search');
  const searchDropdown = document.getElementById('search-dropdown');
  if (searchInput && searchDropdown && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
    searchDropdown.classList.add('hidden');
  }

  const notificationBtn = document.getElementById('notification-bell-btn');
  const notificationMenu = document.getElementById('notification-dropdown-menu');
  if (notificationBtn && notificationMenu && !notificationBtn.contains(e.target) && !notificationMenu.contains(e.target)) {
    notificationMenu.classList.add('hidden');
  }
});

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  renderNotifications();
  updateAnalystUI();
  setExposureSearchMode('domain');
});
