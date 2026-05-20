// src/client/src/config.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.port === '5173' ? 'http://localhost:8080' : window.location.origin);

export default BACKEND_URL;