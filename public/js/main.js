// public/js/main.js
const API = window.API_BASE || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3000/api'
    : '/api');

// Global variables
let allCourses = [];

// Update Navbar (Student aware)
function updateNav() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const loginLink = document.getElementById('nav-login');
  const registerLink = document.getElementById('nav-register');
  const dashboardLink = document.getElementById('nav-dashboard');
  const profileLink = document.getElementById('nav-profile');
  const userInfo = document.getElementById('nav-user-info');
  const logoutBtn = document.getElementById('nav-logout');
  const usernameEl = document.getElementById('nav-username');
  
  if (token && user) {
    // Hide auth links
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    
    // Show student links
    if (dashboardLink) dashboardLink.style.display = 'inline-block';
    if (profileLink) profileLink.style.display = 'inline-block';
    if (userInfo) userInfo.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (usernameEl) usernameEl.textContent = user.username || 'Student';
  } else {
    // Show auth links
    if (loginLink) loginLink.style.display = 'inline-block';
    if (registerLink) registerLink.style.display = 'inline-block';
    
    // Hide student links
    if (dashboardLink) dashboardLink.style.display = 'none';
    if (profileLink) profileLink.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Render courses
function renderCourses(courses) {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  if (courses.length === 0) {
    grid.innerHTML = `<p class="text-gray-400 col-span-full text-center py-12">No courses found.</p>`;
    return;
  }

  grid.innerHTML = courses.map(course => {
    const thumbnail = course.thumbnail || 'https://via.placeholder.com/400x200/0f172a/06b6d4?text=Course';
    const instructor = course.instructor_id?.username || 'Unknown';
    const students = course.students?.length || 0;

    return `
      <div class="course-card" onclick="window.location.href='/course.html?id=${course._id}'">
        <img src="${thumbnail}" alt="${course.title}" 
             onerror="this.src='https://via.placeholder.com/400x200/0f172a/06b6d4?text=Course'"/>
        <div class="course-card-body">
          <h3 class="course-card-title">${course.title}</h3>
          <p class="course-card-instructor">by ${instructor}</p>
          <p class="text-gray-500 text-xs mt-2 line-clamp-2">${course.description}</p>
          
          <div class="course-card-footer">
            <span class="students-badge">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              ${students} students
            </span>
            <span class="free-badge">Free</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Load all courses
async function loadCourses(query = '') {
  const loading = document.getElementById('loading');
  const grid = document.getElementById('courses-grid');
  const empty = document.getElementById('empty');

  if (loading) loading.classList.remove('hidden');
  if (grid) grid.classList.add('hidden');
  if (empty) empty.classList.add('hidden');

  try {
    const res = await fetch(`${API}/courses`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    allCourses = data.courses || [];

    let filteredCourses = allCourses;

    if (query) {
      const q = query.toLowerCase();
      filteredCourses = allCourses.filter(course =>
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q)
      );
    }

    if (filteredCourses.length === 0) {
      if (empty) empty.classList.remove('hidden');
    } else {
      if (grid) grid.classList.remove('hidden');
      renderCourses(filteredCourses);
    }

  } catch (err) {
    console.error(err);
    if (empty) {
      empty.classList.remove('hidden');
      empty.innerHTML = `<p class="text-red-400 text-center py-12">Failed to load courses.<br>Make sure the server is running.</p>`;
    }
  } finally {
    if (loading) loading.classList.add('hidden');
  }
}

// Search functionality
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    loadCourses(e.target.value.trim());
  });
}

// Initialize page
function init() {
  updateNav();
  initSearch();
  loadCourses();
}

// Auto run when script loads
document.addEventListener('DOMContentLoaded', init);