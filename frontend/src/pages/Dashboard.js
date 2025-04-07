import { Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import useTasks from '../hooks/useTasks';

const Dashboard = () => {
    const { tasks, loading, error, fetchTasks } = useTasks();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4 }}>
                <Typography color="error" variant="h6">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    // Ensure tasks is an array before calculating stats
    const taskList = Array.isArray(tasks) ? tasks : [];
    
    const totalTasks = taskList.length;
    const completedTasks = taskList.filter(task => task.status === 'D').length;
    const pendingTasks = taskList.filter(task => task.status === 'T').length;
    const inProgressTasks = taskList.filter(task => task.status === 'P').length;

    const StatCard = ({ title, value, color }) => (
        <Paper
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                backgroundColor: color,
                color: 'white',
            }}
        >
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" component="div">
                {value}
            </Typography>
        </Paper>
    );

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Tasks"
                        value={totalTasks}
                        color="#1976d2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Completed Tasks"
                        value={completedTasks}
                        color="#2e7d32"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Tasks"
                        value={pendingTasks}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="In Progress"
                        value={inProgressTasks}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 