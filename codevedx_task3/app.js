// Main Single Page Application State & Navigation Control
const AppState = {
  departments: [],
  users: [],
  campaigns: [],
  logs: [],
  quizResults: [],
  activeUser: null,
  activeCampaign: null,
  
  async refresh() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      this.departments = data.departments;
      this.users = data.users;
      this.campaigns = data.campaigns;
      this.logs = data.logs;
      this.quizResults = data.quizResults;
      
      this.activeCampaign = this.campaigns.find(c => c.status === 'active') || this.campaigns[this.campaigns.length - 1];
      
      this.populateUserSelect();
      this.updateActiveCampaignBadge();
      
      // Notify other modules to re-render
      if (window.DashboardController) window.DashboardController.render();
      if (window.InboxController) window.InboxController.render();
      if (window.AdminController) window.AdminController.render();
      if (window.LearningController) window.LearningController.render();
    } catch (err) {
      console.error("Failed to refresh app state from server", err);
    }
  },

  populateUserSelect() {
    const select = document.getElementById('simulation-user-select');
    if (!select) return;
    
    // Save selection
    const previousEmail = this.activeUser ? this.activeUser.email : null;
    
    select.innerHTML = '';
    this.users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.email;
      option.textContent = `${user.name} (${user.department})`;
      select.appendChild(option);
    });

    if (previousEmail && this.users.find(u => u.email === previousEmail)) {
      select.value = previousEmail;
      this.activeUser = this.users.find(u => u.email === previousEmail);
    } else if (this.users.length > 0) {
      this.activeUser = this.users[0];
      select.value = this.activeUser.email;
    }
    
    this.updateUserAvatar();
  },

  updateUserAvatar() {
    const avatar = document.getElementById('user-avatar');
    if (!avatar || !this.activeUser) return;
    
    const initials = this.activeUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    avatar.textContent = initials;
    avatar.title = `${this.activeUser.name} - ${this.activeUser.department}`;
  },

  updateActiveCampaignBadge() {
    const badge = document.getElementById('active-campaign-badge');
    if (badge && this.activeCampaign) {
      badge.textContent = `Active Drill: ${this.activeCampaign.name}`;
    }
  }
};

// Router navigation handler
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Routing
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.view-panel');
  const headerTitle = document.getElementById('header-title');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetPanelId = item.getAttribute('data-target');
      
      // Update sidebar styling
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      // Update panels display
      panels.forEach(p => p.classList.remove('active'));
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) targetPanel.classList.add('active');
      
      // Update header title
      const viewTitle = item.querySelector('span').textContent;
      headerTitle.textContent = viewTitle;
      
      // Refresh calculations on active panels if relevant
      if (targetPanelId === 'view-dashboard') {
        AppState.refresh();
      }
    });
  });

  // User Dropdown Change Trigger
  const userSelect = document.getElementById('simulation-user-select');
  if (userSelect) {
    userSelect.addEventListener('change', (e) => {
      const email = e.target.value;
      AppState.activeUser = AppState.users.find(u => u.email === email);
      AppState.updateUserAvatar();
      
      // Re-trigger inbox state
      if (window.InboxController) {
        window.InboxController.resetInboxView();
      }
    });
  }

  // Theme Toggle Button
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  const htmlTag = document.documentElement;

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      htmlTag.setAttribute('data-theme', 'light');
      themeIcon.className = 'fa-solid fa-moon';
      themeText.textContent = 'Dark Mode';
    } else {
      htmlTag.setAttribute('data-theme', 'dark');
      themeIcon.className = 'fa-solid fa-sun';
      themeText.textContent = 'Light Mode';
    }
  });

  // Initialize Data
  AppState.refresh();
});

window.AppState = AppState;
