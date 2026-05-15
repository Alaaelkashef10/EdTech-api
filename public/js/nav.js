// public/js/nav.js — Shared navigation for non-admin pages
// Wrapped in IIFE to avoid global scope pollution

(function() {
  'use strict';

  const API = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  function updateNav() {
    const loginLink = document.getElementById('nav-login');
    const registerLink = document.getElementById('nav-register');
    const logoutBtn = document.getElementById('nav-logout');
    const userInfo = document.getElementById('nav-user-info');
    const usernameEl = document.getElementById('nav-username');
    const avatarEl = document.getElementById('nav-avatar');
    
    const dashboardLink = document.getElementById('nav-dashboard');
    const profileLink = document.getElementById('nav-profile');

    if (token && user) {
      if (loginLink) loginLink.style.display = 'none';
      if (registerLink) registerLink.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (userInfo) userInfo.style.display = 'flex';
      if (usernameEl) usernameEl.textContent = user.username || 'User';
      if (avatarEl) avatarEl.textContent = (user.username || 'U').charAt(0).toUpperCase();
      
      if (user.role === 'student') {
        if (dashboardLink) {
          dashboardLink.style.display = 'inline-block';
          dashboardLink.href = '/dashboard.html';
        }
        if (profileLink) {
          profileLink.style.display = 'inline-block';
          profileLink.href = '/student-profile.html';
        }
      } else if (user.role === 'instructor') {
        if (dashboardLink) {
          dashboardLink.style.display = 'inline-block';
          dashboardLink.href = '/instructor-dashboard.html';
        }
        if (profileLink) {
          profileLink.style.display = 'inline-block';
          profileLink.href = '/instructor-profile.html';
        }
      }
    } else {
      if (loginLink) loginLink.style.display = 'inline-block';
      if (registerLink) registerLink.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'none';
      
      if (dashboardLink) {
        dashboardLink.style.display = 'none';
        dashboardLink.href = '#';
      }
      if (profileLink) {
        profileLink.style.display = 'none';
        profileLink.href = '#';
      }
    }
  }

  function setActiveNav() {
    const path = window.location.pathname;
    const links = {
      '/': 'nav-home',
      '/index.html': 'nav-home',
      '/courses.html': 'nav-courses',
      '/dashboard.html': 'nav-dashboard',
      '/student-profile.html': 'nav-profile',
      '/instructor-dashboard.html': 'nav-dashboard',
      '/instructor-profile.html': 'nav-profile'
    };
    
    const activeId = links[path];
    if (activeId) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const activeLink = document.getElementById(activeId);
      if (activeLink) activeLink.classList.add('active');
    }
  }

  // Expose logout to global scope for onclick handlers
  window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Run on load
  document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    setActiveNav();
  });

})();