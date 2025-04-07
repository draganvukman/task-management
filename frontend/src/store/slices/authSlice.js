import { createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

export const login = (email, password) => async (dispatch) => {
    try {
        dispatch(loginStart());
        const user = await authService.login(email, password);
        dispatch(loginSuccess(user));
    } catch (error) {
        dispatch(loginFailure(error.response?.data?.detail || 'Login failed'));
    }
};

export const register = (userData) => async (dispatch) => {
    try {
        dispatch(loginStart());
        await authService.register(userData);
        const user = await authService.login(userData.email, userData.password);
        dispatch(loginSuccess(user));
    } catch (error) {
        dispatch(loginFailure(error.response?.data?.detail || 'Registration failed'));
    }
};

export const logoutUser = () => (dispatch) => {
    authService.logout();
    dispatch(logout());
};

export default authSlice.reducer; 