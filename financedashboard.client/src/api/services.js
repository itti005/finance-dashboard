import api from './axios';

// AUTH
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

// TRANSACTIONS
export const transactionsApi = {
    getAll: (params) => api.get('/transactions', { params }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),
};

// DASHBOARD
export const dashboardApi = {
    getSummary: () => api.get('/dashboard/summary'),
    getTrends: (months = 6) => api.get('/dashboard/trends', { params: { months } }),
};

// USERS
export const usersApi = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
    updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
};