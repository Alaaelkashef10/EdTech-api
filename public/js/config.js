// public/js/config.js
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:3000/api'
  : '/api';

window.API_BASE = API_BASE;