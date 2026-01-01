import { Grid, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function Dashboard() {
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.users.list });

    // Assuming we implement roles/permissions list api
    const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: api.roles.list });

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4">{users?.length || 0}</Typography>
                    <Typography color="textSecondary">Users</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4">{roles?.length || 0}</Typography>
                    <Typography color="textSecondary">Roles</Typography>
                </Paper>
            </Grid>
        </Grid>
    );
}
