import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

const taskService = {
    getAllTasks: async () => {
        const response = await axios.get(`${API_URL}/tasks/`, {
            headers: authService.getAuthHeader(),
        });
        return response.data;
    },

    getTeamTasks: async () => {
        const response = await axios.get(`${API_URL}/tasks/team/`, {
            headers: authService.getAuthHeader(),
        });
        return response.data;
    },

    getTask: async (id) => {
        const response = await axios.get(`${API_URL}/tasks/${id}/`, {
            headers: authService.getAuthHeader(),
        });
        return response.data;
    },

    createTask: async (taskData) => {
        const response = await axios.post(`${API_URL}/tasks/`, taskData, {
            headers: authService.getAuthHeader(),
        });
        return response.data;
    },

    updateTask: async (id, taskData) => {
        const response = await axios.put(`${API_URL}/tasks/${id}/`, taskData, {
            headers: authService.getAuthHeader(),
        });
        return response.data;
    },

    deleteTask: async (id) => {
        await axios.delete(`${API_URL}/tasks/${id}/`, {
            headers: authService.getAuthHeader(),
        });
    },

    searchTasks: async (query) => {
        const response = await axios.get(`${API_URL}/tasks/?search=${query}`, {
            headers: authService.getAuthHeader(),
        });
        return response.data;
    },

    filterTasks: async (filters) => {
        const queryParams = new URLSearchParams(filters);
        const response = await axios.get(`${API_URL}/tasks/?${queryParams}`, {
            headers: authService.getAuthHeader(),
        });
        return response.data;
    },
};

export default taskService; 