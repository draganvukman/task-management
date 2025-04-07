import { Box, CircularProgress } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskDetail from './pages/TaskDetail';
import TaskList from './pages/TaskList';
import TeamTasks from './pages/TeamTasks';

const PrivateRoute = ({ children }) => {
    const { auth, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return auth ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { auth, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return !auth ? children : <Navigate to="/" />;
};

const AppContent = () => {
    const { auth } = useAuth();

    return (
        <Box sx={{ display: 'flex' }}>
            {auth && <Navbar />}
            {auth && <Sidebar />}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: auth ? 8 : 0 }}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <PrivateRoute>
                                <TaskList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/tasks/team"
                        element={
                            <PrivateRoute>
                                <TeamTasks />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/tasks/:id"
                        element={
                            <PrivateRoute>
                                <TaskDetail />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Box>
        </Box>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
