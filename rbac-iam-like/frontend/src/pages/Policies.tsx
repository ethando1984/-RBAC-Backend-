import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Edit, Delete, Add } from '@mui/icons-material';

export default function Policies() {
    const { data: permissions, isLoading } = useQuery({ queryKey: ['permissions'], queryFn: api.permissions.list });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<any>(null);
    const [formData, setFormData] = useState({ permissionName: '', description: '' });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.permissions.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            handleClose();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.permissions.update(editingPermission.permissionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            handleClose();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.permissions.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions'] })
    });

    const handleOpen = (perm: any = null) => {
        if (perm) {
            setEditingPermission(perm);
            setFormData({ permissionName: perm.permissionName, description: perm.description });
        } else {
            setEditingPermission(null);
            setFormData({ permissionName: '', description: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingPermission(null);
        setFormData({ permissionName: '', description: '' });
    };

    const handleSubmit = () => {
        if (editingPermission) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const columns: GridColDef[] = [
        { field: 'permissionName', headerName: 'Permission Name', width: 250 },
        { field: 'description', headerName: 'Description', width: 350 },
        {
            field: 'action',
            headerName: 'Actions',
            width: 250,
            renderCell: (params) => (
                <Box>
                    <Button size="small" onClick={() => navigate(`/policies/${params.row.permissionId}`)}>Manage Access</Button>
                    <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary"><Edit /></IconButton>
                    <IconButton size="small" onClick={() => deleteMutation.mutate(params.row.permissionId)} color="error"><Delete /></IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Policies (Permissions)</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Policy</Button>
            </Box>
            <DataGrid
                rows={permissions || []}
                columns={columns}
                getRowId={(r) => r.permissionId}
                loading={isLoading}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editingPermission ? 'Edit Policy' : 'Add New Policy'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Permission Name"
                        value={formData.permissionName}
                        onChange={(e) => setFormData({ ...formData, permissionName: e.target.value })}
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
                        {editingPermission ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
