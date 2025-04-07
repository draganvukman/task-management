import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const calendarService = {
    async getEvents() {
        const response = await axios.get(`${API_URL}/calendar/events/`);
        return response.data;
    },

    async createEvent(eventData) {
        const response = await axios.post(`${API_URL}/calendar/events/`, eventData);
        return response.data;
    },

    async updateEvent(eventId, eventData) {
        const response = await axios.put(`${API_URL}/calendar/events/${eventId}/`, eventData);
        return response.data;
    },

    async deleteEvent(eventId) {
        await axios.delete(`${API_URL}/calendar/events/${eventId}/`);
    },

    async syncTasks() {
        const response = await axios.post(`${API_URL}/calendar/sync/`);
        return response.data;
    },
}; 