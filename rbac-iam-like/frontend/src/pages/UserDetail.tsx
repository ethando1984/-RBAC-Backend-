import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Box, Typography, Button, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, Chip, Stack, MenuItem, Select, FormControl, InputLabel, TextField, Switch, FormControlLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { EffectiveAccess } from '../types';
import { useState, useEffect } from 'react';

export default function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState('');
    const [editData, setEditData] = useState({ username: '', email: '', active: true });

    const { data: user } = useQuery({ queryKey: ['user', id], queryFn: () => api.users.get(id!) });
    const { data: accessList } = useQuery({ queryKey: ['access', id], queryFn: () => api.users.getAccess(id!) });
    const { data: allRoles } = useQuery({ queryKey: ['roles'], queryFn: api.roles.list });

    useEffect(() => {
        if (user) {
            setEditData({ username: user.username, email: user.email, active: user.active });
        }
    }, [user]);

    const updateProfileMut = useMutation({
        mutationFn: (data: any) => api.users.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            alert('Profile updated');
        }
    });

    const assignRoleMut = useMutation({
        mutationFn: (roleId: string) => api.assignments.assignRole(id!, roleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access', id] })
    });

    const revokeRoleMut = useMutation({
        mutationFn: (roleId: string) => api.assignments.revokeRole(id!, roleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access', id] })
    });

    const access: EffectiveAccess | undefined = accessList?.[0];

    const assignedRoleIds = new Set(access?.roles.map(r => r.roleId));

    const handleAssign = () => {
        if (selectedRole) assignRoleMut.mutate(selectedRole);
    };

    const handleUpdateProfile = () => {
        updateProfileMut.mutate(editData);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>User Management</Typography>

            <Grid container spacing={4}>
                {/* User Profile Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6">User Profile</Typography>
                        <TextField
                            label="Username"
                            fullWidth
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                        <FormControlLabel
                            control={<Switch checked={editData.active} onChange={(e) => setEditData({ ...editData, active: e.target.checked })} />}
                            label="Active Status"
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleUpdateProfile}
                            disabled={updateProfileMut.isPending}
                        >
                            Update Basic Info
                        </Button>
                    </Paper>
                </Grid>

                {/* Roles Assignments */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Assigned Roles (RBAC)</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} mb={3}>
                            {access?.roles.map(role => (
                                <Chip
                                    key={role.roleId}
                                    label={role.roleName}
                                    color="primary"
                                    onDelete={() => revokeRoleMut.mutate(role.roleId)}
                                />
                            ))}
                            {access?.roles.length === 0 && <Typography variant="body2" color="textSecondary">No roles assigned</Typography>}
                        </Stack>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Assign Role</InputLabel>
                                <Select
                                    value={selectedRole}
                                    label="Assign Role"
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    {allRoles?.filter((r: any) => !assignedRoleIds.has(r.roleId)).map((r: any) => (
                                        <MenuItem key={r.roleId} value={r.roleId}>{r.roleName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={handleAssign} disabled={!selectedRole || assignRoleMut.isPending}>
                                Add
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Effective Access Visualizer */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Effective Permissions</Typography>
                        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                            {access?.roles.map(role => (
                                <Accordion key={role.roleId} disableGutters sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{role.roleName}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box>
                                            {role.permissions.map((perm, idx) => (
                                                <Box key={idx} mb={1} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                                    <Typography variant="caption" sx={{ minWidth: 100, fontWeight: 'bold' }}>{perm.permissionName}</Typography>
                                                    <Chip label={`${perm.namespaceKey}:${perm.actionKey}`} size="small" variant="outlined" />
                                                </Box>
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                            {access?.roles.length === 0 && <Typography variant="body2" color="textSecondary">No permissions derived</Typography>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
