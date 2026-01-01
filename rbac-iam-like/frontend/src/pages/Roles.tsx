import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Edit, Delete, Add } from '@mui/icons-material';

export default function Roles() {
    const { data: roles, isLoading } = useQuery({ queryKey: ['roles'], queryFn: api.roles.list });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [formData, setFormData] = useState({ roleName: '', description: '', systemRole: false });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.roles.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            handleClose();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.roles.update(editingRole.roleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            handleClose();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.roles.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
    });

    const handleOpen = (role: any = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({ roleName: role.roleName, description: role.description, systemRole: role.systemRole });
        } else {
            setEditingRole(null);
            setFormData({ roleName: '', description: '', systemRole: false });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingRole(null);
        setFormData({ roleName: '', description: '', systemRole: false });
    };

    const handleSubmit = () => {
        if (editingRole) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const columns: GridColDef[] = [
        { field: 'roleName', headerName: 'Role Name', width: 200 },
        { field: 'description', headerName: 'Description', width: 350 },
        { field: 'systemRole', headerName: 'System Role', type: 'boolean', width: 120 },
        {
            field: 'action',
            headerName: 'Actions',
            width: 250,
            renderCell: (params) => (
                <Box>
                    <Button size="small" onClick={() => navigate(`/roles/${params.row.roleId}`)}>Manage Access</Button>
                    <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary"><Edit /></IconButton>
                    <IconButton size="small" onClick={() => deleteMutation.mutate(params.row.roleId)} color="error" disabled={params.row.systemRole}><Delete /></IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Roles</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Role</Button>
            </Box>
            <DataGrid
                rows={roles || []}
                columns={columns}
                getRowId={(r) => r.roleId}
                loading={isLoading}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Role Name"
                        value={formData.roleName}
                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        margin="dense"
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingRole ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
