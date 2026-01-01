import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import { Box, CircularProgress } from '@mui/material';

interface RouteGuardProps {
    namespace?: string;
    action?: string;
    role?: string;
}

export const RouteGuard = ({ namespace, action, role }: RouteGuardProps) => {
    const { can, hasRole, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const hasPermission = (namespace && action) ? can(namespace, action) : true;
    const hasRequiredRole = role ? hasRole(role) : true;

    if (!hasPermission || !hasRequiredRole) {
        return <Navigate to="/" />; // Redirect to dashboard if no permission
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};
