import {
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTasks from '../hooks/useTasks';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentTask, loading, getTask, updateTask } = useTasks();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'M',
        status: 'T',
    });

    useEffect(() => {
        if (id) {
            getTask(id);
        }
    }, [id, getTask]);

    useEffect(() => {
        if (currentTask) {
            setFormData({
                title: currentTask.title || '',
                description: currentTask.description || '',
                due_date: currentTask.due_date || '',
                priority: currentTask.priority || 'M',
                status: currentTask.status || 'T',
            });
        }
    }, [currentTask]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateTask(id, formData);
        navigate('/tasks');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {id ? 'Edit Task' : 'Create New Task'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Due Date"
                                type="datetime-local"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="H">High</MenuItem>
                                    <MenuItem value="M">Medium</MenuItem>
                                    <MenuItem value="L">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    label="Status"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="T">To Do</MenuItem>
                                    <MenuItem value="P">In Progress</MenuItem>
                                    <MenuItem value="D">Done</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/tasks')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    {id ? 'Update' : 'Create'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default TaskDetail; 