import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ────────────────────────────────────────────
// CSRF token management
// ────────────────────────────────────────────
let csrfToken = null;

/**
 * Fetch a CSRF token from the server and cache it.
 * This must happen once before any POST / PUT / PATCH / DELETE.
 */
async function ensureCsrfToken() {
    if (csrfToken) return csrfToken;
    try {
        const res = await axios.get('/api/auth/csrf-token', { withCredentials: true });
        csrfToken = res.data.data.csrfToken;
        return csrfToken;
    } catch {
        console.warn('Failed to fetch CSRF token');
        return null;
    }
}

// Pre-fetch the CSRF token on module load
ensureCsrfToken();

// ────────────────────────────────────────────
// Request interceptor — attach JWT + CSRF token
// ────────────────────────────────────────────
api.interceptors.request.use(
    async (config) => {
        // Attach JWT
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Attach CSRF token for state-changing requests
        const method = (config.method || '').toUpperCase();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const csrf = await ensureCsrfToken();
            if (csrf) {
                config.headers['X-CSRF-Token'] = csrf;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ────────────────────────────────────────────
// Response interceptor — handle 401 / refresh / CSRF retry
// ────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If CSRF token was rejected (403), refresh it and retry once
        if (error.response?.status === 403
            && error.response?.data?.message?.includes('CSRF')
            && !originalRequest._csrfRetry) {
            originalRequest._csrfRetry = true;
            csrfToken = null; // clear cached token
            const freshToken = await ensureCsrfToken();
            if (freshToken) {
                originalRequest.headers['X-CSRF-Token'] = freshToken;
                return api(originalRequest);
            }
        }

        // If 401 Unauthorized, try token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshRes = await axios.post('/api/auth/refresh', {}, {
                    withCredentials: true,
                    headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
                });
                const newToken = refreshRes.data.data.accessToken;
                localStorage.setItem('accessToken', newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
