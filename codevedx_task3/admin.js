// Admin Control Panel - Campaign configuration & DB mutation bindings
const AdminController = {
  init() {
    window.AdminController = this;

    // Launch Campaign Form
    const campaignForm = document.getElementById('campaign-config-form');
    if (campaignForm) {
      campaignForm.addEventListener('submit', (e) => this.handleLaunchCampaign(e));
    }

    // Reset Campaign Stats button
    const resetBtn = document.getElementById('reset-campaign-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleResetData());
    }

    // Add User Form
    const userForm = document.getElementById('add-user-form');
    if (userForm) {
      userForm.addEventListener('submit', (e) => this.handleAddUser(e));
    }

    // Add Department Form
    const deptForm = document.getElementById('add-dept-form');
    if (deptForm) {
      deptForm.addEventListener('submit', (e) => this.handleAddDept(e));
    }
  },

  render() {
    // Populate templates selectors
    const templateContainer = document.getElementById('template-selectors');
    if (templateContainer) {
      templateContainer.innerHTML = '';
      MOCK_EMAIL_TEMPLATES.forEach(tmpl => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '8px';
        
        const isPhish = tmpl.type === 'phishing';
        const labelText = `${tmpl.subject} [${tmpl.difficulty} ${isPhish ? 'Phish' : 'Safe'}]`;
        
        div.innerHTML = `
          <input type="checkbox" id="tmpl_${tmpl.id}" value="${tmpl.id}" checked style="width: 16px; height: 16px;">
          <label for="tmpl_${tmpl.id}" style="font-size:13px; color:var(--text-secondary); cursor:pointer;">${labelText}</label>
        `;
        templateContainer.appendChild(div);
      });
    }

    // Populate Department dropdown
    const deptSelect = document.getElementById('new-user-dept');
    if (deptSelect) {
      deptSelect.innerHTML = '<option value="" disabled selected>Assign Department</option>';
      AppState.departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
      });
    }
  },

  async handleLaunchCampaign(e) {
    e.preventDefault();
    const name = document.getElementById('campaign-name').value;
    const sentCount = document.getElementById('campaign-emails-sent').value;

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          emailsSent: sentCount
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully launched simulation campaign: "${name}". Users can now practice evaluating these drills in their Inbox.`);
        document.getElementById('campaign-config-form').reset();
        
        // Return to Dashboard View
        const dashboardNav = document.querySelector('.nav-item[data-target="view-dashboard"]');
        if (dashboardNav) dashboardNav.click();
        
        AppState.refresh();
      } else {
        alert("Error launching campaign: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit campaign request.");
    }
  },

  async handleResetData() {
    if (!confirm("Are you sure you want to reset all simulation stats, logs, and custom employees to baseline defaults?")) {
      return;
    }

    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert("All database metrics successfully reset to defaults.");
        
        // Reset local inbox markers
        if (window.InboxController) {
          window.InboxController.readEmailIds.clear();
          window.InboxController.reportedEmailIds.clear();
          window.InboxController.trustedEmailIds.clear();
          window.InboxController.resetInboxView();
        }

        AppState.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reset database logs.");
    }
  },

  async handleAddUser(e) {
    e.preventDefault();
    const name = document.getElementById('new-user-name').value;
    const email = document.getElementById('new-user-email').value;
    const dept = document.getElementById('new-user-dept').value;

    if (!dept) {
      alert("Please select a department assignment.");
      return;
    }

    try {
      const res = await fetch('/api/settings/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          value: { name, email, department: dept }
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Added mock user "${name}" successfully.`);
        document.getElementById('add-user-form').reset();
        AppState.refresh();
      } else {
        alert("Failed to add user: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  },

  async handleAddDept(e) {
    e.preventDefault();
    const deptName = document.getElementById('new-dept-name').value;

    try {
      const res = await fetch('/api/settings/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'department',
          value: deptName
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Added department "${deptName}" successfully.`);
        document.getElementById('add-dept-form').reset();
        AppState.refresh();
      } else {
        alert("Failed to add department: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  }
};

// Bind load
document.addEventListener('DOMContentLoaded', () => AdminController.init());
