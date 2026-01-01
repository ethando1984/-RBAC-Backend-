import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import { Box, CircularProgress } from '@mui/material';

interface RouteGuardProps {
    namespace: string;
    action: string;
}

export const RouteGuard = ({ namespace, action }: RouteGuardProps) => {
    const { can, isLoading, user } = useAuth();

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

    if (!can(namespace, action)) {
        return <Navigate to="/" />; // Redirect to dashboard if no permission
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};
