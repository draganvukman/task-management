import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const authService = {
    login: async (email, password) => {
        const response = await axios.post(`${API_URL}/token/`, {
            email,
            password,
        });
        if (response.data.access) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    register: async (userData) => {
        const response = await axios.post(`${API_URL}/users/register/`, userData);
        return response.data;
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getAuthHeader: () => {
        const user = authService.getCurrentUser();
        if (user && user.access) {
            return { Authorization: `Bearer ${user.access}` };
        }
        return {};
    },
};

export default authService; 