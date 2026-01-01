import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Box, Typography, Button, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, Chip, Stack, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { EffectiveAccess } from '../types';
import { useState } from 'react';

export default function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState('');

    const { data: user } = useQuery({ queryKey: ['user', id], queryFn: () => api.users.get(id!) });
    const { data: accessList } = useQuery({ queryKey: ['access', id], queryFn: () => api.users.getAccess(id!) });
    const { data: allRoles } = useQuery({ queryKey: ['roles'], queryFn: api.roles.list });

    const assignRoleMut = useMutation({
        mutationFn: (roleId: string) => api.assignments.assignRole(id!, roleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access'] })
    });

    const revokeRoleMut = useMutation({
        mutationFn: (roleId: string) => api.assignments.revokeRole(id!, roleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access'] })
    });

    const access: EffectiveAccess | undefined = accessList?.[0]; // accessList is array

    const assignedRoleIds = new Set(access?.roles.map(r => r.roleId));

    const handleAssign = () => {
        if (selectedRole) assignRoleMut.mutate(selectedRole);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>{user?.username}</Typography>
            <Typography color="textSecondary" mb={4}>{user?.email}</Typography>

            <Grid container spacing={4}>
                {/* Roles Assignments */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" mb={2}>Assigned Roles</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} mb={3}>
                            {access?.roles.map(role => (
                                <Chip key={role.roleId} label={role.roleName} onDelete={() => revokeRoleMut.mutate(role.roleId)} />
                            ))}
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

                {/* Effective Access */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" mb={2}>Effective Access (Visualizer)</Typography>
                        <Box>
                            {access?.roles.map(role => (
                                <Accordion key={role.roleId} defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography sx={{ fontWeight: 'bold' }}>{role.roleName}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box pl={2}>
                                            {role.permissions.map((perm, idx) => (
                                                <Box key={idx} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="body2" sx={{ minWidth: 150 }}>{perm.permissionName}</Typography>
                                                    <Chip label={perm.namespaceKey || 'Global'} size="small" color="primary" variant="outlined" />
                                                    <Chip label={perm.actionKey || '*'} size="small" color="secondary" variant="outlined" />
                                                </Box>
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
