import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Task Management
                </Typography>
                <Box>
                    <Button color="inherit" onClick={logout}>
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 