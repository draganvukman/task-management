import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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
    Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import useTasks from '../hooks/useTasks';
import api from '../services/api';

const TeamTasks = () => {
    const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [openTeamDialog, setOpenTeamDialog] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [teamError, setTeamError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'T',
        priority: 'M',
        due_date: '',
        team_id: '',
    });
    const [formError, setFormError] = useState(null);

    const fetchTeams = useCallback(async () => {
        try {
            setTeamError(null);
            const response = await api.get('/api/teams/');
            setTeams(response.data);
            if (response.data.length > 0 && !selectedTeam) {
                setSelectedTeam(response.data[0].id);
            }
        } catch (err) {
            console.error('Error fetching teams:', err);
            setTeamError('Failed to fetch teams. Please try again.');
        }
    }, [selectedTeam]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    useEffect(() => {
        if (selectedTeam) {
            fetchTasks(`?team_id=${selectedTeam}`);
        }
    }, [selectedTeam, fetchTasks]);

    const handleCreateTeam = async () => {
        try {
            setTeamError(null);
            const response = await api.post('/api/teams/', { name: newTeamName });
            setTeams([...teams, response.data]);
            setOpenTeamDialog(false);
            setNewTeamName('');
        } catch (err) {
            console.error('Error creating team:', err);
            setTeamError('Failed to create team. Please try again.');
        }
    };

    const handleOpenDialog = (task = null) => {
        if (task) {
            setSelectedTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date || '',
                team_id: task.team?.id || selectedTeam,
            });
        } else {
            setSelectedTask(null);
            setFormData({
                title: '',
                description: '',
                status: 'T',
                priority: 'M',
                due_date: '',
                team_id: selectedTeam,
            });
        }
        setOpenTaskDialog(true);
    };

    const handleClose = () => {
        setOpenTaskDialog(false);
        setSelectedTask(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedTask) {
                await updateTask(selectedTask.id, formData);
            } else {
                await createTask(formData);
            }
            fetchTasks(`?team_id=${selectedTeam}`);
            handleClose();
        } catch (error) {
            console.error('Error saving task:', error);
            setFormError('Failed to save task. Please try again.');
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId);
                fetchTasks(`?team_id=${selectedTeam}`);
            } catch (err) {
                console.error('Error deleting task:', err);
            }
        }
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

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                {(error || teamError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error || teamError}
                    </Alert>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        Team Tasks
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenTeamDialog(true)}
                            sx={{ mr: 2 }}
                        >
                            Create Team
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDialog()}
                            disabled={teams.length === 0}
                        >
                            Create Task
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Select Team</InputLabel>
                            <Select
                                value={selectedTeam}
                                label="Select Team"
                                onChange={(e) => setSelectedTeam(e.target.value)}
                            >
                                {teams.map(team => (
                                    <MenuItem key={team.id} value={team.id}>
                                        {team.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{task.description}</TableCell>
                                    <TableCell>{getStatusLabel(task.status)}</TableCell>
                                    <TableCell>{getPriorityLabel(task.priority)}</TableCell>
                                    <TableCell>{task.due_date}</TableCell>
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
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Team Creation Dialog */}
                <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)}>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Team Name"
                            type="text"
                            fullWidth
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Task Dialog */}
                <Dialog open={openTaskDialog} onClose={handleClose}>
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
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            {selectedTask ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default TeamTasks; 