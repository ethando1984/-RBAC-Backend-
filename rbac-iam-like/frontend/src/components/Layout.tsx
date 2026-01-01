import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { Dashboard as DashboardIcon, People, Security, Policy, Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Guard } from './Guard';
import { type ReactNode } from 'react';

const drawerWidth = 240;

export default function Layout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/', guard: null },
        { text: 'Users', icon: <People />, path: '/users', guard: { role: 'Super Administrator' } },
        { text: 'Roles', icon: <Security />, path: '/roles', guard: { role: 'Super Administrator' } },
        { text: 'Policies', icon: <Policy />, path: '/policies', guard: { role: 'Super Administrator' } },
        { text: 'Orders', icon: <Policy />, path: '/orders', guard: { ns: 'orders', act: 'READ' } },
        { text: 'Inventory', icon: <Security />, path: '/inventory', guard: { ns: 'inventory', act: 'READ' } },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        RBAC IAM-like
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>{user?.username}</Typography>
                    <IconButton color="inherit" onClick={logout}><Logout /></IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => {
                            const Item = (
                                <ListItem key={item.text} disablePadding>
                                    <ListItemButton
                                        selected={location.pathname.startsWith(item.path === '/' ? '@@' : item.path) || (item.path === '/' && location.pathname === '/')}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItemButton>
                                </ListItem>
                            );

                            if (item.guard) {
                                return (
                                    <Guard
                                        key={item.text}
                                        role={(item.guard as any).role}
                                        namespace={(item.guard as any).ns}
                                        action={(item.guard as any).act}
                                    >
                                        {Item}
                                    </Guard>
                                );
                            }
                            return Item;
                        })}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
