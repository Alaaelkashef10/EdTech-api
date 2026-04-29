const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const params = new URLSearchParams(window.location.search);
const courseId = params.get('id');
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

let isEnrolled = false;
let lessonsData = [];

// Update navbar
function updateNav() {
  const nav = document.getElementById('nav-auth');
  if (!nav) return;
  if (token && user) {
    nav.innerHTML = `
      <span class="text-gray-300 text-sm">Hi, <strong>${user.username}</strong></span>
      <button onclick="logout()" class="btn-ghost text-sm px-4 py-2 rounded-lg">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="/login.html" class="text-gray-300 hover:text-white transition text-sm">Login</a>
      <a href="/register.html" class="btn-primary text-sm px-4 py-2 rounded-lg">Get Started</a>
    `;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Load course
async function loadCourse() {
  if (!courseId) return window.location.href = '/';

  try {
    const res = await fetch(`${API}/courses/${courseId}`);
    const data = await res.json();

    if (!data.success) return window.location.href = '/';

    const course = data.course;

    document.title = `${course.title} — EduFlow`;
    document.getElementById('course-title').textContent = course.title;
    document.getElementById('course-description').textContent = course.description;
    document.getElementById('course-thumbnail').src = course.thumbnail || 'https://via.placeholder.com/400x200/0f172a/06b6d4?text=Course';
    document.getElementById('instructor-name').textContent = course.instructor_id?.username || 'Unknown';
    document.getElementById('instructor-avatar').textContent = (course.instructor_id?.username || 'U')[0].toUpperCase();

    // Check if enrolled
    if (user) {
      isEnrolled = course.students?.some(s => (s._id || s) === user.id);
      const isInstructor = course.instructor_id?._id === user.id;

      if (isEnrolled || isInstructor) {
        document.getElementById('enroll-btn').textContent = isInstructor ? 'Your Course' : 'Continue Learning';
        document.getElementById('enroll-btn').disabled = isInstructor;
        document.getElementById('enroll-msg').textContent = isInstructor ? '' : 'You are enrolled';
        if (isEnrolled) loadProgress();
      }
    }

    document.getElementById('course-loading').classList.add('hidden');
    document.getElementById('course-content').classList.remove('hidden');

    loadLessons();

  } catch (err) {
    window.location.href = '/';
  }
}

// Load lessons
async function loadLessons() {
  const container = document.getElementById('lessons-list');
  const loading = document.getElementById('lessons-loading');

  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(`${API}/courses/${courseId}/lessons`, { headers });
    const data = await res.json();

    loading.classList.add('hidden');

    if (!data.success || data.lessons.length === 0) {
      container.classList.remove('hidden');
      container.innerHTML = '<p class="text-gray-500 text-sm">No lessons available yet.</p>';
      return;
    }

    lessonsData = data.lessons;
    container.classList.remove('hidden');
    renderLessons();

  } catch (err) {
    loading.textContent = 'Failed to load lessons.';
  }
}

// Load progress
async function loadProgress() {
  if (!token) return;

  try {
    const res = await fetch(`${API}/courses/${courseId}/progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.success) return;

    document.getElementById('progress-section').classList.remove('hidden');
    document.getElementById('progress-percent').textContent = `${data.percentage}%`;
    document.getElementById('progress-bar').style.width = `${data.percentage}%`;
    document.getElementById('progress-label').textContent = `${data.completedCount} of ${data.totalLessons} lessons completed`;

    // Map completed lessons
    const completedIds = new Set(
      data.progress.filter(p => p.completed).map(p => p.lesson_id)
    );

    renderLessons(completedIds);

  } catch (err) {}
}

// Render lessons
function renderLessons(completedIds = new Set()) {
  const container = document.getElementById('lessons-list');

  container.innerHTML = lessonsData.map((lesson, i) => {
    const isCompleted = completedIds.has(lesson._id);
    const isLocked = lesson.locked;

    return `
      <div class="lesson-item ${isCompleted ? 'completed' : ''}" onclick="handleLesson('${lesson._id}', ${isLocked}, ${isCompleted})">
        <div class="flex items-center gap-3">
          <div class="lesson-number ${isCompleted ? 'completed' : ''}">
            ${isCompleted ? '✓' : i + 1}
          </div>
          <div>
            <p class="text-sm font-medium">${lesson.title}</p>
            ${isLocked ? '<p class="lesson-locked">🔒 Enroll to unlock</p>' : ''}
            ${isCompleted ? '<p class="text-xs text-emerald-400">Completed</p>' : ''}
          </div>
        </div>
        ${isEnrolled && !isLocked ? `
          <button onclick="event.stopPropagation(); markComplete('${lesson._id}', ${isCompleted})"
            class="text-xs px-3 py-1 rounded-lg border transition ${isCompleted
              ? 'border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
              : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'}">
            ${isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
}

function handleLesson(lessonId, locked, completed) {
  if (locked) {
    if (!token) return window.location.href = '/login.html';
    alert('Please enroll in this course to access lessons.');
  }
}

// Mark lesson complete/incomplete
async function markComplete(lessonId, currentlyCompleted) {
  if (!token) return window.location.href = '/login.html';

  try {
    const res = await fetch(`${API}/courses/${courseId}/progress/${lessonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed: !currentlyCompleted })
    });

    const data = await res.json();
    if (data.success) loadProgress();

  } catch (err) {}
}

// Enroll
async function enrollCourse() {
  if (!token) return window.location.href = '/login.html';

  const btn = document.getElementById('enroll-btn');
  btn.textContent = 'Enrolling...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    if (data.success) {
      isEnrolled = true;
      btn.textContent = 'Continue Learning';
      document.getElementById('enroll-msg').textContent = 'Successfully enrolled!';
      loadLessons();
      loadProgress();
    } else {
      btn.textContent = 'Enroll Now';
      btn.disabled = false;
      document.getElementById('enroll-msg').textContent = data.message;
    }

  } catch (err) {
    btn.textContent = 'Enroll Now';
    btn.disabled = false;
  }
}

updateNav();
loadCourse();