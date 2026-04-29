const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

let isInstructor = false;

function setRole(instructor) {
  isInstructor = instructor;
  document.getElementById('btn-student')?.classList.toggle('active', !instructor);
  document.getElementById('btn-instructor')?.classList.toggle('active', instructor);
}

function showError(msg) {
  const el = document.getElementById('error-msg');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError() {
  const el = document.getElementById('error-msg');
  if (el) el.classList.add('hidden');
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.label || btn.textContent;
}

async function register() {
  hideError();
  const username = document.getElementById('username')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!username || !email || !password) {
    return showError('Please fill in all fields.');
  }

  setLoading('register-btn', true);
  document.getElementById('register-btn').textContent = 'Creating account...';

  try {
    const res = await fetch(`${API}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, is_instructor: isInstructor }),
    });

    const data = await res.json();

    if (!data.success) {
      if (data.errors) {
        return showError(data.errors.map(e => e.message).join(', '));
      }
      return showError(data.message);
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/';

  } catch (err) {
    showError('Something went wrong. Try again.');
  } finally {
    setLoading('register-btn', false);
    const btn = document.getElementById('register-btn');
    if (btn) btn.textContent = 'Create Account';
  }
}

async function login() {
  hideError();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!email || !password) {
    return showError('Please fill in all fields.');
  }

  const btn = document.getElementById('login-btn');
  if (btn) btn.textContent = 'Signing in...';

  try {
    const res = await fetch(`${API}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      if (data.errors) {
        return showError(data.errors.map(e => e.message).join(', '));
      }
      return showError(data.message);
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/';

  } catch (err) {
    showError('Something went wrong. Try again.');
  } finally {
    if (btn) btn.textContent = 'Sign In';
  }
}

// Redirect if already logged in
if (localStorage.getItem('token')) {
  window.location.href = '/';
}
