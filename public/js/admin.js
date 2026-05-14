// public/js/admin.js
const API = window.API_BASE || 'http://127.0.0.1:3000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'admin') {
  alert("Access Denied! Admins only.");
  window.location.href = '/';
}

async function loadAdminDashboard() {
  try {
    // Get all users
    const res = await fetch(`${API}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('total-users').textContent = data.count || data.users.length;
      renderUsers(data.users);
    }
  } catch (err) {
    console.error(err);
  }
}

function renderUsers(users) {
  const container = document.getElementById('users-list');
  container.innerHTML = users.map(u => `
    <div class="flex justify-between items-center p-4 border-b border-gray-800 last:border-0">
      <div>
        <p class="font-medium">${u.username}</p>
        <p class="text-sm text-gray-400">${u.email}</p>
      </div>
      <div class="text-sm">
        <span class="px-3 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-500' : u.role === 'instructor' ? 'bg-orange-500' : 'bg-cyan-500'}">
          ${u.role}
        </span>
      </div>
    </div>
  `).join('');
}

// Init
loadAdminDashboard();