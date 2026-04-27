import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors and return data
api.interceptors.response.use(
    (response) => {
        // Return the actual data (which is the account list, etc.)
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Prevent infinite redirect loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/signin', credentials),
    signup: (data) => api.post('/auth/signup', data),
};

export const accountService = {
    getAccounts: () => api.get('/accounts'),
    getAccountByNumber: (number) => api.get(`/accounts/number/${number}`),
    createAccount: (data) => api.post('/accounts', data),
    getBalance: (id) => api.get(`/accounts/${id}/balance`),
    updateStatus: (id, status) => api.put(`/accounts/${id}/status`, { status }),
};

export const transactionService = {
    transfer: (data) => api.post('/transactions/transfer', data),
    deposit: (accountNumber, amount) => api.post(`/transactions/deposit?accountNumber=${accountNumber}&amount=${amount}`),
    withdraw: (accountNumber, amount) => api.post(`/transactions/withdraw?accountNumber=${accountNumber}&amount=${amount}`),
};

export default api;
