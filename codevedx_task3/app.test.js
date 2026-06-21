const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

function startServer() {
  return new Promise((resolve, reject) => {
    // Spawn server.js
    serverProcess = spawn('node', [path.join(__dirname, '..', 'server.js')], {
      env: { ...process.env, PORT: 3500 },
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('running on http://localhost:3500')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error during startup: ${data}`);
    });

    setTimeout(() => reject(new Error('Server start timed out')), 4000);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
}

// Simple HTTP client utility
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: JSON.parse(data)
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== Launching Phishing Platform Integration Tests ===");
  
  try {
    await startServer();
    console.log("✓ Server spawned successfully on port 3500");

    // Test 1: Get Stats API
    console.log("Testing GET /api/stats...");
    const statsRes = await makeRequest({
      hostname: 'localhost',
      port: 3500,
      path: '/api/stats',
      method: 'GET'
    });

    if (statsRes.statusCode !== 200) throw new Error(`Stats endpoint failed with status ${statsRes.statusCode}`);
    if (!Array.isArray(statsRes.data.users)) throw new Error("Users database structure missing");
    if (!Array.isArray(statsRes.data.departments)) throw new Error("Departments database structure missing");
    console.log("✓ GET /api/stats returns valid schema logs and settings");

    // Test 2: Log Action API
    console.log("Testing POST /api/log-action...");
    const logRes = await makeRequest({
      hostname: 'localhost',
      port: 3500,
      path: '/api/log-action',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      campaignId: 'campaign_2026_q2',
      userEmail: 'alice.j@corp-company.com',
      userName: 'Alice Johnson',
      department: 'Engineering',
      templateId: 'google_alert',
      action: 'clicked'
    });

    if (logRes.statusCode !== 200) throw new Error(`Log action failed with status ${logRes.statusCode}`);
    if (!logRes.data.success || !logRes.data.log) throw new Error("Log action returned unsuccessful state");
    console.log("✓ POST /api/log-action logged mock click event successfully");

    // Test 3: Submit Quiz score
    console.log("Testing POST /api/quiz/submit...");
    const quizRes = await makeRequest({
      hostname: 'localhost',
      port: 3500,
      path: '/api/quiz/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      userName: 'Bob Smith',
      score: 100,
      total: 100
    });

    if (quizRes.statusCode !== 200) throw new Error(`Quiz submission failed with status ${quizRes.statusCode}`);
    if (!quizRes.data.success) throw new Error("Quiz submit returned failure");
    console.log("✓ POST /api/quiz/submit logged quiz record");

    console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===");
    process.exit(0);

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  } finally {
    stopServer();
  }
}

runTests();
