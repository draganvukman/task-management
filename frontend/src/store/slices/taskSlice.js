import { createSlice } from '@reduxjs/toolkit';
import taskService from '../../services/taskService';

const initialState = {
    tasks: [],
    teamTasks: [],
    currentTask: null,
    loading: false,
    error: null,
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        setTeamTasks: (state, action) => {
            state.teamTasks = action.payload;
        },
        setCurrentTask: (state, action) => {
            state.currentTask = action.payload;
        },
        addTask: (state, action) => {
            state.tasks.unshift(action.payload);
        },
        updateTask: (state, action) => {
            const index = state.tasks.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        },
        deleteTask: (state, action) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload);
        },
    },
});

export const {
    setLoading,
    setError,
    setTasks,
    setTeamTasks,
    setCurrentTask,
    addTask,
    updateTask,
    deleteTask,
} = taskSlice.actions;

export const fetchTasks = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const tasks = await taskService.getAllTasks();
        dispatch(setTasks(tasks));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const fetchTeamTasks = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const tasks = await taskService.getTeamTasks();
        dispatch(setTeamTasks(tasks));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const createNewTask = (taskData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const newTask = await taskService.createTask(taskData);
        dispatch(addTask(newTask));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateExistingTask = (id, taskData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const updatedTask = await taskService.updateTask(id, taskData);
        dispatch(updateTask(updatedTask));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const deleteExistingTask = (id) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        await taskService.deleteTask(id);
        dispatch(deleteTask(id));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export default taskSlice.reducer; 