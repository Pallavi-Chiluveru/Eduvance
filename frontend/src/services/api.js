import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
    baseURL: baseUrl.endsWith('/api') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CSRF token management
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let csrfToken = null;
let csrfRequest = null;
let refreshRequest = null;

// Share a single request so concurrent mutations use the same cookie/token pair.
async function ensureCsrfToken() {
    if (csrfToken) return csrfToken;
    if (!csrfRequest) {
        csrfRequest = api.get('/auth/csrf-token').then((res) => {
            csrfToken = res.data.data.csrfToken;
            if (!csrfToken) throw new Error('Unable to obtain a CSRF token. Please try again.');
            return csrfToken;
        }).finally(() => { csrfRequest = null; });
    }
    return csrfRequest;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Request interceptor â€” attach JWT + CSRF token
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Response interceptor â€” handle 401 / refresh / CSRF retry
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);
        if (error.response?.status === 429) {
            const retryAfter = Number(error.response.headers?.['retry-after']);
            if (Number.isFinite(retryAfter) && retryAfter > 0 && error.response.data) {
                error.response.data.message = `Too many requests. Please try again in ${Math.ceil(retryAfter)} seconds.`;
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 403
            && error.response?.data?.message === 'Instructor approval required'
            && window.location.pathname !== '/instructor/verification') {
            window.location.replace('/instructor/verification');
            return Promise.reject(error);
        }
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
        const isAuthEntryRequest = /\/auth\/(login|register|refresh|csrf-token)(?:[?#]|$)/.test(originalRequest.url || '');
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEntryRequest) {
            originalRequest._retry = true;

            try {
                if (!refreshRequest) {
                    refreshRequest = api.post('/auth/refresh', {}).finally(() => { refreshRequest = null; });
                }
                const refreshRes = await refreshRequest;
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
