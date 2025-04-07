import { useCallback, useState } from 'react';
import api from '../services/api';

const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async (queryParams = '') => {
        try {
            setLoading(true);
            setError(null);
            const url = queryParams ? `/api/tasks${queryParams}` : '/api/tasks/';
            const response = await api.get(url);
            setTasks(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to fetch tasks. Please try again.');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTask = async (taskData) => {
        try {
            setError(null);
            const response = await api.post('/api/tasks/', taskData);
            setTasks(prevTasks => Array.isArray(prevTasks) ? [...prevTasks, response.data] : [response.data]);
            return response.data;
        } catch (err) {
            console.error('Error creating task:', err);
            setError('Failed to create task. Please try again.');
            throw err;
        }
    };

    const updateTask = async (id, taskData) => {
        try {
            setError(null);
            const response = await api.put(`/api/tasks/${id}/`, taskData);
            setTasks(prevTasks => {
                if (!Array.isArray(prevTasks)) return [response.data];
                return prevTasks.map(task => task.id === id ? response.data : task);
            });
            return response.data;
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Failed to update task. Please try again.');
            throw err;
        }
    };

    const deleteTask = async (id) => {
        try {
            setError(null);
            await api.delete(`/api/tasks/${id}/`);
            setTasks(prevTasks => {
                if (!Array.isArray(prevTasks)) return [];
                return prevTasks.filter(task => task.id !== id);
            });
        } catch (err) {
            console.error('Error deleting task:', err);
            setError('Failed to delete task. Please try again.');
            throw err;
        }
    };

    const getTeamTasks = async (teamId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/teams/${teamId}/tasks/`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (err) {
            console.error('Error fetching team tasks:', err);
            setError('Failed to fetch team tasks. Please try again.');
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        getTeamTasks,
    };
};

export default useTasks; 