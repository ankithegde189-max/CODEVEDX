// Interactive Mock Email Client & Sandbox Browser Simulation
const InboxController = {
  activeEmail: null,
  readEmailIds: new Set(),
  reportedEmailIds: new Set(),
  trustedEmailIds: new Set(),

  init() {
    // Bind to window to allow external calls
    window.InboxController = this;
  },

  render() {
    const listContainer = document.getElementById('email-list-container');
    if (!listContainer) return;

    // Render email listing
    listContainer.innerHTML = '';
    
    MOCK_EMAIL_TEMPLATES.forEach(email => {
      // Check if user has already acted on this email
      const isReported = this.reportedEmailIds.has(email.id);
      const isTrusted = this.trustedEmailIds.has(email.id);
      const isRead = this.readEmailIds.has(email.id);
      
      let statusIndicator = '';
      if (isReported) statusIndicator = '<span class="badge warning" style="font-size:9px; padding:2px 5px;"><i class="fa-solid fa-flag"></i> Reported</span>';
      else if (isTrusted) statusIndicator = '<span class="badge success" style="font-size:9px; padding:2px 5px;"><i class="fa-solid fa-check"></i> Safe</span>';
      
      const itemDiv = document.createElement('div');
      itemDiv.className = `email-item ${!isRead && !isReported && !isTrusted ? 'unread' : ''} ${this.activeEmail && this.activeEmail.id === email.id ? 'active' : ''}`;
      
      itemDiv.innerHTML = `
        <div class="email-item-header">
          <span>${email.date}</span>
          ${statusIndicator}
        </div>
        <div class="email-sender">${email.senderName}</div>
        <div class="email-subject">${email.subject}</div>
        <div class="email-preview-snippet">${email.preview}</div>
      `;
      
      itemDiv.addEventListener('click', () => this.selectEmail(email));
      listContainer.appendChild(itemDiv);
    });

    this.updateUnreadCount();
  },

  updateUnreadCount() {
    const badge = document.getElementById('inbox-unread-count');
    if (!badge) return;
    
    let unread = 0;
    MOCK_EMAIL_TEMPLATES.forEach(email => {
      if (!this.readEmailIds.has(email.id) && !this.reportedEmailIds.has(email.id) && !this.trustedEmailIds.has(email.id)) {
        unread++;
      }
    });

    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  },

  selectEmail(email) {
    this.activeEmail = email;
    this.readEmailIds.add(email.id);
    this.render(); // Redraw items to reflect read status
    
    const detailContainer = document.getElementById('email-detail-container');
    if (!detailContainer) return;

    const isReported = this.reportedEmailIds.has(email.id);
    const isTrusted = this.trustedEmailIds.has(email.id);
    const hasActed = isReported || isTrusted;

    detailContainer.innerHTML = `
      <div class="email-content-wrapper">
        <div class="email-action-bar">
          <div class="action-buttons">
            <button class="btn btn-danger" id="btn-report-phish" ${hasActed ? 'disabled' : ''}>
              <i class="fa-solid fa-triangle-exclamation"></i> Report Phishing
            </button>
            <button class="btn btn-success" id="btn-trust-email" ${hasActed ? 'disabled' : ''}>
              <i class="fa-solid fa-check"></i> Mark as Safe
            </button>
          </div>
          <span style="font-size:12px; color:var(--text-muted);">Sender IP Integrity: Check Domain</span>
        </div>
        
        <div class="email-detail-header">
          <h2 class="email-detail-subject">${email.subject}</h2>
          <div class="email-detail-meta">
            <div class="meta-row">
              <span class="meta-label">From:</span>
              <span class="meta-val"><b>${email.senderName}</b> &lt;${email.senderEmail}&gt;</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">To:</span>
              <span class="meta-val">${email.recipient}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Date:</span>
              <span class="meta-val">${email.date}</span>
            </div>
          </div>
        </div>
        
        <div class="email-detail-body">
          <div class="mock-email-body">
            ${email.bodyHtml}
          </div>
        </div>
      </div>
    `;

    // Intercept clicks on links inside the mock email body
    const links = detailContainer.querySelectorAll('.mock-email-body a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLinkClick(email);
      });
    });

    // Wire Report Button
    document.getElementById('btn-report-phish').addEventListener('click', () => {
      this.handleReportAction(email);
    });

    // Wire Trust Button
    document.getElementById('btn-trust-email').addEventListener('click', () => {
      this.handleTrustAction(email);
    });
  },

  resetInboxView() {
    this.activeEmail = null;
    const detailContainer = document.getElementById('email-detail-container');
    if (detailContainer) {
      detailContainer.innerHTML = `
        <div class="inbox-view-placeholder">
          <i class="fa-solid fa-inbox"></i>
          <p>Select an email from the list to review and practice identifying phishing signals.</p>
        </div>
      `;
    }
    this.render();
  },

  async handleReportAction(email) {
    this.reportedEmailIds.add(email.id);
    this.render();
    this.selectEmail(email); // Update button states

    const isPhish = (email.type === 'phishing');
    
    // Log to API
    await fetch('/api/log-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: AppState.activeCampaign ? AppState.activeCampaign.id : 'campaign_active_training',
        userEmail: AppState.activeUser.email,
        userName: AppState.activeUser.name,
        department: AppState.activeUser.department,
        templateId: email.id,
        action: 'reported'
      })
    });

    if (isPhish) {
      alert(`Correct! You successfully identified and reported a phishing email from "${email.senderName}". Good job!`);
    } else {
      alert(`False Positive Alert: You reported a legitimate communication. Remember to inspect sender headers carefully.`);
    }

    AppState.refresh();
  },

  async handleTrustAction(email) {
    this.trustedEmailIds.add(email.id);
    this.render();
    this.selectEmail(email); // Update button states

    const isPhish = (email.type === 'phishing');

    if (isPhish) {
      // Log failure: marking phish as safe is a compromise trigger
      await fetch('/api/log-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: AppState.activeCampaign ? AppState.activeCampaign.id : 'campaign_active_training',
          userEmail: AppState.activeUser.email,
          userName: AppState.activeUser.name,
          department: AppState.activeUser.department,
          templateId: email.id,
          action: 'compromised'
        })
      });

      alert(`Danger! You marked a simulated phishing email as SAFE. Showing Teachable Moment details now.`);
      this.openTeachableModal(email);
    } else {
      // Log legitimate read
      await fetch('/api/log-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: AppState.activeCampaign ? AppState.activeCampaign.id : 'campaign_active_training',
          userEmail: AppState.activeUser.email,
          userName: AppState.activeUser.name,
          department: AppState.activeUser.department,
          templateId: email.id,
          action: 'ignored' // Handled safely
        })
      });

      alert(`Correct: This is a safe, legitimate communication.`);
    }

    AppState.refresh();
  },

  async handleLinkClick(email) {
    // If legitimate email, just open the mock browser, it's safe
    // If phishing, logging "clicked" event
    
    if (email.type === 'phishing') {
      await fetch('/api/log-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: AppState.activeCampaign ? AppState.activeCampaign.id : 'campaign_active_training',
          userEmail: AppState.activeUser.email,
          userName: AppState.activeUser.name,
          department: AppState.activeUser.department,
          templateId: email.id,
          action: 'clicked'
        })
      });
    }

    // Open Mock Browser modal
    const modal = document.getElementById('mock-browser-modal');
    const urlBar = document.getElementById('browser-url-bar');
    const lockIcon = document.getElementById('browser-lock-icon');
    const viewport = document.getElementById('browser-viewport-content');

    urlBar.textContent = email.mockBrowserUrl;
    
    // Set lock icon style based on URL security
    if (email.mockBrowserUrl.startsWith('https://')) {
      lockIcon.className = 'fa-solid fa-lock secure';
      lockIcon.title = 'Connection is encrypted (though domain may be spoofed!)';
    } else {
      lockIcon.className = 'fa-solid fa-triangle-exclamation warning';
      lockIcon.title = 'Warning: Unencrypted connection (HTTP)';
    }

    if (email.type === 'phishing') {
      viewport.innerHTML = email.mockLoginHtml;
      
      // Intercept mock login submissions
      setTimeout(() => {
        const form = document.getElementById('mock-login-form');
        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Log compromised
            await fetch('/api/log-action', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                campaignId: AppState.activeCampaign ? AppState.activeCampaign.id : 'campaign_active_training',
                userEmail: AppState.activeUser.email,
                userName: AppState.activeUser.name,
                department: AppState.activeUser.department,
                templateId: email.id,
                action: 'compromised'
              })
            });

            // Close browser & Open Teachable moments details
            modal.classList.remove('active');
            this.openTeachableModal(email);
            AppState.refresh();
          });
        }
      }, 100);
    } else {
      // Legitimate portal display mockup
      viewport.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
          <i class="fa-regular fa-circle-check" style="font-size: 54px; color: #10b981; margin-bottom: 20px;"></i>
          <h2>Welcome to the DevOps Digest Sandbox Portal</h2>
          <p style="color: #666; margin-top: 10px;">This destination is legitimate and completely secure.</p>
        </div>
      `;
    }

    modal.classList.add('active');
  },

  openTeachableModal(email) {
    const modal = document.getElementById('teachable-moment-modal');
    if (!modal) return;

    // Header Subject
    document.getElementById('teachable-preview-header').textContent = `Subject: ${email.subject}`;

    // Highlight body flags
    let highlightedBody = email.bodyHtml;
    
    // Inject visual boxes for teachable context
    email.redFlags.forEach(flag => {
      if (flag.highlightId === 'sender-flag') {
        // Just note it in visual
      } else if (flag.highlightId === 'link-flag') {
        highlightedBody = highlightedBody.replace('id="mock-email-link"', `id="mock-email-link" class="highlighted-flag" data-flag-num="${flag.num}"`);
      } else if (flag.highlightId === 'urgency-flag') {
        // Highlight critical tables or paragraphs
        highlightedBody = highlightedBody.replace('required to select', `<span class="highlighted-flag" data-flag-num="${flag.num}">required to select</span>`);
        highlightedBody = highlightedBody.replace('Action Required:', `<span class="highlighted-flag" data-flag-num="${flag.num}">Action Required:</span>`);
        highlightedBody = highlightedBody.replace('OVERDUE INVOICE', `<span class="highlighted-flag" data-flag-num="${flag.num}">OVERDUE INVOICE</span>`);
      }
    });

    document.getElementById('teachable-preview-body').innerHTML = `
      <div style="border-bottom:1px solid #ddd; padding-bottom:8px; margin-bottom:12px; font-size:12px; color:#555;">
        <b>From:</b> <span class="highlighted-flag" data-flag-num="1">${email.senderName} &lt;${email.senderEmail}&gt;</span><br>
        <b>To:</b> ${email.recipient}
      </div>
      <div class="mock-email-body">${highlightedBody}</div>
    `;

    // Render Red Flags descriptions
    const listElement = document.getElementById('teachable-flags-list');
    listElement.innerHTML = '';
    
    email.redFlags.forEach(flag => {
      const item = document.createElement('div');
      item.className = 'red-flag-item';
      item.innerHTML = `
        <div class="flag-num">${flag.num}</div>
        <div class="flag-details">
          <h5>${flag.title}</h5>
          <p>${flag.description}</p>
        </div>
      `;
      listElement.appendChild(item);
    });

    modal.style.display = 'flex';
  }
};

// Global helper closures
function closeMockBrowser() {
  const modal = document.getElementById('mock-browser-modal');
  if (modal) modal.classList.remove('active');
}

function closeTeachableModal() {
  const modal = document.getElementById('teachable-moment-modal');
  if (modal) modal.style.display = 'none';
}

// Bind load
document.addEventListener('DOMContentLoaded', () => InboxController.init());
