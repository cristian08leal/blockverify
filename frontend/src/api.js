// api.js — Centralized API client for BlockVerify
const BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * Generic fetch wrapper that handles network errors gracefully.
 */
async function apiFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    // Surface the backend's error message when available
    throw new Error(data.error || `Error ${response.status}`);
  }
  return data;
}

/**
 * GET /api/health
 * Returns blockchain connection status.
 */
export async function getHealth() {
  return apiFetch('/health');
}

/**
 * POST /api/register
 * @param {File} file
 */
export async function registerDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch('/register', { method: 'POST', body: formData });
}

/**
 * POST /api/verify
 * @param {File} file
 */
export async function verifyDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch('/verify', { method: 'POST', body: formData });
}

/**
 * GET /api/history
 */
export async function getHistory() {
  return apiFetch('/history');
}

/**
 * POST /api/revoke
 * @param {string} documentHash
 */
export async function revokeDocument(documentHash) {
  return apiFetch('/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentHash }),
  });
}
