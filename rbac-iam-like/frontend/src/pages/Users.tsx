import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Add } from '@mui/icons-material';

export default function Users() {
    const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: api.users.list });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.users.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleClose();
        }
    });

    const handleOpen = () => {
        setFormData({ username: '', email: '', password: '' });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        createMutation.mutate({ ...formData, active: true });
    };

    const columns: GridColDef[] = [
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'active', headerName: 'Active', type: 'boolean', width: 100 },
        {
            field: 'action',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Button size="small" onClick={() => navigate(`/users/${params.row.userId}`)}>Manage</Button>
            ),
        },
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Users</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>Add User</Button>
            </Box>
            <DataGrid
                rows={users || []}
                columns={columns}
                getRowId={(r) => r.userId}
                loading={isLoading}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
