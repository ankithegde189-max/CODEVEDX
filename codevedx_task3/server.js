const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read DB
function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { departments: [], users: [], campaigns: [], logs: [], quizResults: [] };
  }
}

// Helper to write DB
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing to database file", err);
  }
}

// Retrieve entire state for dashboard calculations
app.get('/api/stats', (req, res) => {
  const db = readDb();
  res.json({
    departments: db.departments,
    users: db.users,
    campaigns: db.campaigns,
    logs: db.logs,
    quizResults: db.quizResults
  });
});

// Post a new log action (clicked, reported, compromised, ignored)
app.post('/api/log-action', (req, res) => {
  const { campaignId, userEmail, userName, department, templateId, action } = req.body;
  if (!userEmail || !action || !templateId) {
    return res.status(400).json({ error: 'Missing mandatory tracking parameters' });
  }

  const db = readDb();
  const newLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    campaignId: campaignId || 'campaign_active_training',
    userEmail,
    userName: userName || userEmail.split('@')[0],
    department: department || 'General',
    templateId,
    action,
    timestamp: new Date().toISOString()
  };

  db.logs.push(newLog);
  writeDb(db);
  res.json({ success: true, log: newLog });
});

// Configure new Campaign / Reset Campaign stats
app.post('/api/campaigns', (req, res) => {
  const { name, startDate, endDate, emailsSent } = req.body;
  if (!name) return res.status(400).json({ error: 'Campaign name required' });

  const db = readDb();
  // Deactivate existing campaigns
  db.campaigns.forEach(c => {
    if (c.status === 'active') c.status = 'completed';
  });

  const newCampaign = {
    id: `campaign_${Date.now()}`,
    name,
    status: 'active',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '',
    emailsSent: parseInt(emailsSent, 10) || 50
  };

  db.campaigns.push(newCampaign);
  writeDb(db);
  res.json({ success: true, campaign: newCampaign });
});

// Add department or user
app.post('/api/settings/add', (req, res) => {
  const { type, value } = req.body;
  const db = readDb();

  if (type === 'department') {
    if (!db.departments.includes(value)) {
      db.departments.push(value);
      writeDb(db);
      return res.json({ success: true, list: db.departments });
    }
    return res.status(400).json({ error: 'Department already exists' });
  } else if (type === 'user') {
    const { name, email, department } = value;
    if (!name || !email || !department) {
      return res.status(400).json({ error: 'User attributes missing' });
    }
    const exists = db.users.find(u => u.email === email);
    if (!exists) {
      const newUser = { id: Date.now(), name, email, department };
      db.users.push(newUser);
      writeDb(db);
      return res.json({ success: true, users: db.users });
    }
    return res.status(400).json({ error: 'User email already exists' });
  }

  res.status(400).json({ error: 'Invalid settings type' });
});

// Submit Quiz score
app.post('/api/quiz/submit', (req, res) => {
  const { userName, score, total } = req.body;
  if (!userName || score === undefined || total === undefined) {
    return res.status(400).json({ error: 'Missing quiz submission parameters' });
  }

  const db = readDb();
  const newRecord = {
    userName,
    score: parseInt(score, 10),
    total: parseInt(total, 10),
    timestamp: new Date().toISOString()
  };

  db.quizResults.push(newRecord);
  writeDb(db);
  res.json({ success: true, record: newRecord });
});

// Reset database logs and custom users to defaults
app.post('/api/reset', (req, res) => {
  const defaultDb = {
    departments: ["Engineering", "Human Resources", "Finance & Accounts", "Sales & Marketing", "Legal & Compliance"],
    users: [
      { id: 1, name: "Alice Johnson", email: "alice.j@corp-company.com", department: "Engineering" },
      { id: 2, name: "Bob Smith", email: "bob.s@corp-company.com", department: "Human Resources" },
      { id: 3, name: "Charlie Brown", email: "charlie.b@corp-company.com", department: "Finance & Accounts" },
      { id: 4, name: "David Miller", email: "david.m@corp-company.com", department: "Sales & Marketing" },
      { id: 5, name: "Eva Davis", email: "eva.d@corp-company.com", department: "Legal & Compliance" },
      { id: 6, name: "Frank Wilson", email: "frank.w@corp-company.com", department: "Engineering" },
      { id: 7, name: "Grace Lee", email: "grace.l@corp-company.com", department: "Human Resources" }
    ],
    campaigns: [
      { id: "campaign_2026_q1", name: "Q1 2026 Security Awareness", status: "completed", startDate: "2026-02-10", endDate: "2026-02-20", emailsSent: 35 },
      { id: "campaign_2026_q2", name: "Q2 2026 Urgent HR Update Simulation", status: "active", startDate: "2026-06-15", endDate: "2026-06-30", emailsSent: 42 }
    ],
    logs: [
      { id: "log_001", campaignId: "campaign_2026_q1", userEmail: "alice.j@corp-company.com", userName: "Alice Johnson", department: "Engineering", templateId: "it_pass_reset", action: "reported", timestamp: "2026-02-11T09:12:00Z" },
      { id: "log_002", campaignId: "campaign_2026_q1", userEmail: "bob.s@corp-company.com", userName: "Bob Smith", department: "Human Resources", templateId: "it_pass_reset", action: "clicked", timestamp: "2026-02-11T10:14:00Z" },
      { id: "log_003", campaignId: "campaign_2026_q1", userEmail: "bob.s@corp-company.com", userName: "Bob Smith", department: "Human Resources", templateId: "it_pass_reset", action: "compromised", timestamp: "2026-02-11T10:15:00Z" },
      { id: "log_004", campaignId: "campaign_2026_q1", userEmail: "charlie.b@corp-company.com", userName: "Charlie Brown", department: "Finance & Accounts", templateId: "it_pass_reset", action: "clicked", timestamp: "2026-02-12T11:05:00Z" },
      { id: "log_005", campaignId: "campaign_2026_q1", userEmail: "charlie.b@corp-company.com", userName: "Charlie Brown", department: "Finance & Accounts", templateId: "it_pass_reset", action: "compromised", timestamp: "2026-02-12T11:06:00Z" }
    ],
    quizResults: [
      { userName: "Alice Johnson", score: 90, total: 100, timestamp: "2026-06-18T11:00:00Z" }
    ]
  };

  writeDb(defaultDb);
  res.json({ success: true, db: defaultDb });
});

// Fallback to client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Phishing Simulation Server running on http://localhost:${PORT}`);
});
