import { Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useTasks from '../hooks/useTasks';
import api from '../services/api';

const TaskList = () => {
    const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
    const [teams, setTeams] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [formError, setFormError] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        team_id: '',
        search: ''
    });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'T',
        priority: 'M',
        due_date: '',
        team_id: '',
    });

    const fetchTeams = useCallback(async () => {
        try {
            const response = await api.get('/api/teams/');
            setTeams(response.data);
            if (!selectedTask && response.data.length > 0) {
                setFormData(prev => ({ ...prev, team_id: response.data[0].id }));
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }, [selectedTask]);

    useEffect(() => {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.priority) queryParams.append('priority', filters.priority);
        if (filters.team_id) queryParams.append('team_id', filters.team_id);
        
        fetchTasks(`/?${queryParams.toString()}`);
        fetchTeams();
    }, [fetchTasks, fetchTeams, filters.status, filters.priority, filters.team_id]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = !filters.search || 
                task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));
            
            return matchesSearch;
        });
    }, [tasks, filters.search]);

    const handleOpenDialog = (task = null) => {
        setFormError('');
        if (task) {
            setSelectedTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date || '',
                team_id: task.team?.id || '',
            });
        } else {
            setSelectedTask(null);
            setFormData({
                title: '',
                description: '',
                status: 'T',
                priority: 'M',
                due_date: '',
                team_id: teams.length > 0 ? teams[0].id : '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTask(null);
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.team_id) {
            setFormError('Please select a team');
            return;
        }

        try {
            if (selectedTask) {
                await updateTask(selectedTask.id, formData);
            } else {
                await createTask(formData);
            }
            handleCloseDialog();
            fetchTasks();
        } catch (err) {
            console.error('Error saving task:', err);
            setFormError(err.message || 'Failed to save task');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(id);
                fetchTasks();
            } catch (err) {
                console.error('Error deleting task:', err);
            }
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'T': return 'To Do';
            case 'P': return 'In Progress';
            case 'D': return 'Done';
            default: return status;
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'H': return 'High';
            case 'M': return 'Medium';
            case 'L': return 'Low';
            default: return priority;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    <Typography color="error" variant="h6">
                        Error: {error}
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        Tasks
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog()}
                        disabled={teams.length === 0}
                    >
                        Create Task
                    </Button>
                </Box>

                {teams.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Please create a team before creating tasks.
                    </Alert>
                )}

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                    <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Search Tasks"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Search by title or description..."
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    label="Status"
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    sx={{ minWidth: '200px' }}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="T">To Do</MenuItem>
                                    <MenuItem value="P">In Progress</MenuItem>
                                    <MenuItem value="D">Done</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={filters.priority}
                                    label="Priority"
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    sx={{ minWidth: '200px' }}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="H">High</MenuItem>
                                    <MenuItem value="M">Medium</MenuItem>
                                    <MenuItem value="L">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Team</InputLabel>
                                <Select
                                    value={filters.team_id}
                                    label="Team"
                                    onChange={(e) => handleFilterChange('team_id', e.target.value)}
                                    sx={{ minWidth: '200px' }}
                                >
                                    <MenuItem value="">All Teams</MenuItem>
                                    {teams.map((team) => (
                                        <MenuItem key={team.id} value={team.id}>
                                            {team.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Team</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{getStatusLabel(task.status)}</TableCell>
                                    <TableCell>{getPriorityLabel(task.priority)}</TableCell>
                                    <TableCell>{task.due_date}</TableCell>
                                    <TableCell>{task.team?.name || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(task)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(task.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTasks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No tasks found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>
                        {selectedTask ? 'Edit Task' : 'Create Task'}
                    </DialogTitle>
                    <DialogContent>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formError}
                            </Alert>
                        )}
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Status"
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <MenuItem value="T">To Do</MenuItem>
                                    <MenuItem value="P">In Progress</MenuItem>
                                    <MenuItem value="D">Done</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <MenuItem value="H">High</MenuItem>
                                    <MenuItem value="M">Medium</MenuItem>
                                    <MenuItem value="L">Low</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                margin="normal"
                                fullWidth
                                type="date"
                                label="Due Date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel>Team</InputLabel>
                                <Select
                                    value={formData.team_id}
                                    label="Team"
                                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                                    required
                                >
                                    {teams.map((team) => (
                                        <MenuItem key={team.id} value={team.id}>
                                            {team.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            {selectedTask ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default TaskList; 