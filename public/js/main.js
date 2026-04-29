const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

// Update navbar based on auth state
function updateNav() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const nav = document.getElementById('nav-auth');
  if (!nav) return;

  if (token && user) {
    nav.innerHTML = `
      <span class="text-gray-300 text-sm">Hi, <strong>${user.username}</strong></span>
      ${user.is_instructor ? `<a href="/dashboard.html" class="text-cyan-400 hover:underline text-sm">Dashboard</a>` : ''}
      <button onclick="logout()" class="btn-ghost text-sm px-4 py-2 rounded-lg">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="/login.html" class="text-gray-300 hover:text-white transition text-sm font-medium">Login</a>
      <a href="/register.html" class="btn-primary text-sm px-4 py-2 rounded-lg">Get Started</a>
    `;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Fetch and render courses
async function loadCourses(query = '') {
  const loading = document.getElementById('loading');
  const grid = document.getElementById('courses-grid');
  const empty = document.getElementById('empty');

  loading.classList.remove('hidden');
  grid.classList.add('hidden');
  empty.classList.add('hidden');

  try {
    const res = await fetch(`${API}/courses`);
    const data = await res.json();

    loading.classList.add('hidden');

    let courses = data.courses || [];

    if (query) {
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (courses.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    grid.classList.remove('hidden');
    grid.innerHTML = courses.map(course => renderCourseCard(course)).join('');

  } catch (err) {
    loading.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.innerHTML = '<p class="text-red-400">Failed to load courses. Make sure the server is running.</p>';
  }
}

function renderCourseCard(course) {
  const thumbnail = course.thumbnail || 'https://via.placeholder.com/400x200/0f172a/06b6d4?text=Course';
  const instructor = course.instructor_id?.username || 'Unknown';
  const students = course.students?.length || 0;

  return `
    <div class="course-card" onclick="window.location.href='/course.html?id=${course._id}'">
      <img src="${thumbnail}" alt="${course.title}" onerror="this.src='https://via.placeholder.com/400x200/0f172a/06b6d4?text=Course'"/>
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
}

// Search
document.getElementById('search-input')?.addEventListener('input', (e) => {
  loadCourses(e.target.value);
});

// Init
updateNav();
loadCourses();
