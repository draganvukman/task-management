import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuth(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/api/token/', {
                email: email,
                password: password
            });
            const { access, refresh } = response.data;
            localStorage.setItem('token', access);
            localStorage.setItem('refresh_token', refresh);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            setAuth(true);
            navigate('/');
            return response.data;
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/api/users/register/', userData);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        setAuth(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ auth, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 