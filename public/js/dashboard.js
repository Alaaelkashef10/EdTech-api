/**
 * dashboard.js – Handles both Student and Instructor dashboard views.
 * Uses a dynamic API base URL so it works in both dev (localhost:3000) and production.
 */

const API   = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');

// ── Guard ────────────────────────────────────────────────────────────────────
if (!token || !user) {
  window.location.href = '/login.html';
}

// ── Utility helpers ──────────────────────────────────────────────────────────

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

function authHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/** Show a toast notification at the top-right of the screen */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Slide in
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // Auto-dismiss after 3 s
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
  document.getElementById('nav-username').textContent = user.username;

  if (user.is_instructor) {
    document.getElementById('dashboard-title').textContent    = 'Instructor Dashboard';
    document.getElementById('dashboard-subtitle').textContent = 'Manage your courses and track student progress';
    loadInstructorDashboard();
  } else {
    document.getElementById('dashboard-title').textContent    = 'My Learning';
    document.getElementById('dashboard-subtitle').textContent = 'Track your progress and continue learning';
    loadStudentDashboard();
  }

  document.getElementById('dashboard-loading').classList.add('hidden');
}

// ── STUDENT DASHBOARD ────────────────────────────────────────────────────────

async function loadStudentDashboard() {
  document.getElementById('student-dashboard').classList.remove('hidden');

  const loading = document.getElementById('student-courses-loading');
  const grid    = document.getElementById('student-courses');
  const empty   = document.getElementById('student-empty');

  try {
    const res  = await fetch(`${API}/courses/me/courses`, { headers: authHeaders() });
    const data = await res.json();

    loading.classList.add('hidden');

    if (!data.success || !data.courses || data.courses.length === 0) {
      empty.classList.remove('hidden');
      document.getElementById('stat-enrolled').textContent   = '0';
      document.getElementById('stat-completed').textContent  = '0';
      document.getElementById('stat-inprogress').textContent = '0';
      return;
    }

    const courses = data.courses;
    document.getElementById('stat-enrolled').textContent = courses.length;

    // Fetch progress for each enrolled course in parallel
    const progressData = await Promise.all(
      courses.map(async (course) => {
        try {
          const r = await fetch(`${API}/courses/${course._id}/progress`, { headers: authHeaders() });
          const d = await r.json();
          return { courseId: course._id, percentage: d.percentage ?? 0 };
        } catch {
          return { courseId: course._id, percentage: 0 };
        }
      })
    );

    const progressMap = {};
    progressData.forEach(p => (progressMap[p.courseId] = p.percentage));

    const completed  = progressData.filter(p => p.percentage === 100).length;
    const inProgress = progressData.filter(p => p.percentage > 0 && p.percentage < 100).length;

    document.getElementById('stat-completed').textContent  = completed;
    document.getElementById('stat-inprogress').textContent = inProgress;

    grid.classList.remove('hidden');
    grid.innerHTML = courses.map(course => {
      const pct       = progressMap[course._id] ?? 0;
      const thumbnail = course.thumbnail || 'https://placehold.co/400x200/0f172a/06b6d4?text=Course';
      const pctColor  = pct === 100 ? 'text-emerald-400' : 'text-cyan-400';

      return `
        <div class="course-card" onclick="window.location.href='/course.html?id=${course._id}'">
          <img src="${thumbnail}" alt="${course.title}"
            onerror="this.src='https://placehold.co/400x200/0f172a/06b6d4?text=Course'"/>
          <div class="course-card-body">
            <h3 class="course-card-title">${course.title}</h3>
            <p class="course-card-instructor">by ${course.instructor_id?.username || 'Unknown'}</p>
            <div class="mt-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-500">Progress</span>
                <span class="text-xs font-semibold ${pctColor}">${pct}%</span>
              </div>
              <div class="progress-bar-bg rounded-full h-1.5">
                <div class="progress-bar-fill h-1.5 rounded-full" style="width:${pct}%"></div>
              </div>
              ${pct === 100 ? '<p class="text-xs text-emerald-400 mt-1">🎉 Completed!</p>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    loading.textContent = 'Failed to load courses. Is the server running?';
    loading.classList.remove('hidden');
    loading.classList.add('text-red-400');
  }
}

// ── INSTRUCTOR DASHBOARD ─────────────────────────────────────────────────────

async function loadInstructorDashboard() {
  document.getElementById('instructor-dashboard').classList.remove('hidden');

  const loading   = document.getElementById('instructor-courses-loading');
  const container = document.getElementById('instructor-courses');
  const empty     = document.getElementById('instructor-empty');

  try {
    const res  = await fetch(`${API}/courses`, { headers: authHeaders() });
    const data = await res.json();

    loading.classList.add('hidden');

    // Filter to only this instructor's courses
    const myCourses = (data.courses || []).filter(c => {
      const instructorId = c.instructor_id?._id || c.instructor_id;
      return String(instructorId) === String(user.id);
    });

    if (myCourses.length === 0) {
      empty.classList.remove('hidden');
      document.getElementById('stat-courses').textContent  = '0';
      document.getElementById('stat-students').textContent = '0';
      document.getElementById('stat-lessons').textContent  = '0';
      return;
    }

    const totalStudents = myCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
    document.getElementById('stat-courses').textContent  = myCourses.length;
    document.getElementById('stat-students').textContent = totalStudents;

    // Count lessons across all courses
    let totalLessons = 0;
    await Promise.all(
      myCourses.map(async (course) => {
        try {
          const r = await fetch(`${API}/courses/${course._id}/lessons`, { headers: authHeaders() });
          const d = await r.json();
          totalLessons += d.lessons?.length || 0;
        } catch {}
      })
    );
    document.getElementById('stat-lessons').textContent = totalLessons;

    container.classList.remove('hidden');
    container.innerHTML = myCourses.map(course => renderInstructorCourse(course)).join('');

  } catch (err) {
    loading.textContent = 'Failed to load courses. Is the server running?';
    loading.classList.remove('hidden');
    loading.classList.add('text-red-400');
  }
}

function renderInstructorCourse(course) {
  const thumbnail = course.thumbnail || 'https://placehold.co/400x200/0f172a/06b6d4?text=Course';
  const students  = course.students?.length || 0;
  const created   = new Date(course.createdAt).toLocaleDateString();

  return `
    <div class="instructor-course-card rounded-2xl overflow-hidden">
      <div class="flex flex-col md:flex-row">
        <img src="${thumbnail}" alt="${course.title}"
          class="w-full md:w-48 h-36 object-cover flex-shrink-0"
          onerror="this.src='https://placehold.co/400x200/0f172a/06b6d4?text=Course'"/>
        <div class="p-5 flex-1">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-bold text-base mb-1">${course.title}</h3>
              <p class="text-gray-400 text-sm line-clamp-2">${course.description}</p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <a href="/course.html?id=${course._id}" class="btn-ghost text-xs px-3 py-2 rounded-lg">View</a>
              <button onclick="toggleStudentsPanel('${course._id}')"
                class="btn-primary text-xs px-3 py-2 rounded-lg">
                Students (${students})
              </button>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-4">
            <span class="text-xs text-gray-500 flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              ${students} enrolled
            </span>
            <span class="text-xs text-gray-500">Created ${created}</span>
          </div>
        </div>
      </div>

      <!-- Students panel (toggle) -->
      <div id="students-panel-${course._id}" class="hidden border-t border-gray-800 p-5">
        <h4 class="text-sm font-semibold mb-3 text-gray-300">Enrolled Students & Progress</h4>
        <div id="students-list-${course._id}">
          <p class="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    </div>
  `;
}

async function toggleStudentsPanel(courseId) {
  const panel = document.getElementById(`students-panel-${courseId}`);
  const list  = document.getElementById(`students-list-${courseId}`);

  if (!panel.classList.contains('hidden')) {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');
  list.innerHTML = '<p class="text-gray-500 text-sm">Loading…</p>';

  try {
    const res  = await fetch(`${API}/courses/${courseId}/progress`, { headers: authHeaders() });
    const data = await res.json();

    if (!data.success) {
      list.innerHTML = '<p class="text-gray-500 text-sm">No data available.</p>';
      return;
    }

    if (!data.studentsProgress || data.studentsProgress.length === 0) {
      list.innerHTML = '<p class="text-gray-500 text-sm">No students enrolled yet.</p>';
      return;
    }

    list.innerHTML = data.studentsProgress.map(sp => `
      <div class="flex items-center justify-between py-2 border-b border-gray-800/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
            ${sp.student.username[0].toUpperCase()}
          </div>
          <div>
            <p class="text-sm font-medium">${sp.student.username}</p>
            <p class="text-xs text-gray-500">${sp.student.email}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-24">
            <div class="progress-bar-bg rounded-full h-1.5">
              <div class="progress-bar-fill h-1.5 rounded-full" style="width:${sp.percentage}%"></div>
            </div>
          </div>
          <span class="text-xs font-semibold w-12 text-right ${sp.percentage === 100 ? 'text-emerald-400' : 'text-cyan-400'}">
            ${sp.percentage}%
          </span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    list.innerHTML = '<p class="text-red-400 text-sm">Failed to load student data.</p>';
  }
}

// ── CREATE COURSE ────────────────────────────────────────────────────────────

async function createCourse() {
  const title       = document.getElementById('new-title').value.trim();
  const description = document.getElementById('new-description').value.trim();
  const thumbnail   = document.getElementById('new-thumbnail').value.trim();

  const errorEl   = document.getElementById('create-error');
  const successEl = document.getElementById('create-success');

  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');

  if (!title || !description) {
    errorEl.textContent = 'Title and description are required.';
    errorEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('create-btn');
  btn.textContent = 'Creating…';
  btn.disabled = true;

  try {
    const res  = await fetch(`${API}/courses`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ title, description, thumbnail }),
    });
    const data = await res.json();

    if (!data.success) {
      errorEl.textContent = data.errors
        ? data.errors.map(e => e.message).join(', ')
        : (data.message || 'Failed to create course.');
      errorEl.classList.remove('hidden');
      return;
    }

    // Show success and reload the list
    showToast(`Course "${data.course.title}" created!`);
    document.getElementById('new-title').value       = '';
    document.getElementById('new-description').value = '';
    document.getElementById('new-thumbnail').value   = '';

    setTimeout(() => {
      document.getElementById('instructor-courses-loading').classList.remove('hidden');
      document.getElementById('instructor-courses').classList.add('hidden');
      loadInstructorDashboard();
    }, 800);

  } catch (err) {
    errorEl.textContent = 'Something went wrong. Please try again.';
    errorEl.classList.remove('hidden');
  } finally {
    btn.textContent = 'Create Course';
    btn.disabled    = false;
  }
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
init();