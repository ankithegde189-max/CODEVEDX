// Admin Dashboard Operations & Data Charts Binding
const DashboardController = {
  deptChartInstance: null,
  timelineChartInstance: null,

  init() {
    window.DashboardController = this;

    // CSV export listener
    const exportBtn = document.getElementById('export-logs-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportLogsToCsv());
    }
  },

  render() {
    if (!AppState.activeCampaign) return;

    // Filter logs for the active campaign
    const campaignLogs = AppState.logs.filter(l => l.campaignId === AppState.activeCampaign.id);
    const totalSent = AppState.activeCampaign.emailsSent;

    // Calculate unique metrics (a user might click then submit credentials)
    const clickedUsers = new Set(campaignLogs.filter(l => l.action === 'clicked').map(l => l.userEmail));
    const compromisedUsers = new Set(campaignLogs.filter(l => l.action === 'compromised').map(l => l.userEmail));
    const reportedUsers = new Set(campaignLogs.filter(l => l.action === 'reported').map(l => l.userEmail));

    const clickRate = Math.round((clickedUsers.size / totalSent) * 100);
    const compromiseRate = Math.round((compromisedUsers.size / totalSent) * 100);
    const reportRate = Math.round((reportedUsers.size / totalSent) * 100);

    // Bind metrics to KPIs
    document.getElementById('kpi-sent').textContent = totalSent;
    document.getElementById('kpi-clicked').textContent = `${clickRate}%`;
    document.getElementById('kpi-compromised').textContent = `${compromiseRate}%`;
    document.getElementById('kpi-reported').textContent = `${reportRate}%`;

    // Render Table Logs
    this.renderLogsTable(campaignLogs);

    // Initialize/Update Charts
    this.renderDepartmentChart(campaignLogs);
    this.renderTimelineChart(campaignLogs);
  },

  renderLogsTable(logs) {
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Sort logs descending by timestamp
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (sortedLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No simulation activities logged yet for this campaign.</td></tr>`;
      return;
    }

    sortedLogs.forEach(log => {
      let actionBadge = '';
      if (log.action === 'clicked') actionBadge = '<span class="badge warning">Clicked Link</span>';
      else if (log.action === 'compromised') actionBadge = '<span class="badge danger">Credentials Entered</span>';
      else if (log.action === 'reported') actionBadge = '<span class="badge success">Reported Phish</span>';
      else actionBadge = '<span class="badge info">Read Email</span>';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${log.userName}</b><br><span style="font-size:11px; color:var(--text-muted);">${log.userEmail}</span></td>
        <td>${log.department}</td>
        <td><code style="background:rgba(255,255,255,0.05); padding:2px 4px; border-radius:4px;">${log.templateId}</code></td>
        <td>${actionBadge}</td>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  renderDepartmentChart(logs) {
    const canvas = document.getElementById('deptChart');
    if (!canvas) return;

    // Destructure theme tokens
    const textThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';
    const gridThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#223056';

    // Compute department stats
    const deptStats = {};
    AppState.departments.forEach(dept => {
      deptStats[dept] = { targeted: 0, clickedOrCompromised: new Set() };
    });

    // Populate targeted count per department from current mock user list size
    AppState.users.forEach(u => {
      if (deptStats[u.department]) {
        // Average campaign distribution: assume each department has users targeted relative to user count
        deptStats[u.department].targeted += 1;
      }
    });

    logs.forEach(log => {
      if (deptStats[log.department] && (log.action === 'clicked' || log.action === 'compromised')) {
        deptStats[log.department].clickedOrCompromised.add(log.userEmail);
      }
    });

    const labels = Object.keys(deptStats);
    const dataValues = labels.map(dept => {
      const targeted = deptStats[dept].targeted || 1;
      const compromised = deptStats[dept].clickedOrCompromised.size;
      return Math.round((compromised / targeted) * 100);
    });

    if (this.deptChartInstance) {
      this.deptChartInstance.destroy();
    }

    this.deptChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Susceptibility Rate (%)',
          data: dataValues,
          backgroundColor: 'rgba(239, 68, 68, 0.65)',
          borderColor: '#ef4444',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: gridThemeColor },
            ticks: { color: textThemeColor, font: { family: 'Inter' } }
          },
          y: {
            grid: { color: gridThemeColor },
            ticks: { color: textThemeColor },
            min: 0,
            max: 100
          }
        }
      }
    });
  },

  renderTimelineChart(logs) {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;

    const textThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';
    const gridThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#223056';

    // Group counts by dates
    const dateGroups = {};
    
    // Seed last 5 days
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateGroups[dateStr] = { clicks: 0, compromised: 0, reports: 0 };
    }

    logs.forEach(log => {
      const dateStr = log.timestamp.split('T')[0];
      if (dateGroups[dateStr]) {
        if (log.action === 'clicked') dateGroups[dateStr].clicks++;
        else if (log.action === 'compromised') dateGroups[dateStr].compromised++;
        else if (log.action === 'reported') dateGroups[dateStr].reports++;
      }
    });

    const labels = Object.keys(dateGroups);
    const clicks = labels.map(d => dateGroups[d].clicks);
    const compromises = labels.map(d => dateGroups[d].compromised);
    const reports = labels.map(d => dateGroups[d].reports);

    if (this.timelineChartInstance) {
      this.timelineChartInstance.destroy();
    }

    this.timelineChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.map(l => l.substring(5)), // MM-DD formatting
        datasets: [
          {
            label: 'Reported',
            data: reports,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Clicked Links',
            data: clicks,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Credentials Lost',
            data: compromises,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: textThemeColor, font: { family: 'Inter' } }
          }
        },
        scales: {
          x: {
            grid: { color: gridThemeColor },
            ticks: { color: textThemeColor }
          },
          y: {
            grid: { color: gridThemeColor },
            ticks: { color: textThemeColor, stepSize: 1 }
          }
        }
      }
    });
  },

  exportLogsToCsv() {
    if (!AppState.logs || AppState.logs.length === 0) {
      alert("No simulation logs available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Campaign,Employee Name,Employee Email,Department,Email Template,Action,Timestamp\n";

    AppState.logs.forEach(log => {
      const row = [
        log.id,
        log.campaignId,
        `"${log.userName}"`,
        log.userEmail,
        `"${log.department}"`,
        log.templateId,
        log.action,
        log.timestamp
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `secushield_phishing_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Bind load
document.addEventListener('DOMContentLoaded', () => DashboardController.init());
