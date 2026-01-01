import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Box, Typography, Button, Paper, Chip, Stack, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useState } from 'react';

export default function RoleDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [selectedPermission, setSelectedPermission] = useState('');

    const { data: role } = useQuery({ queryKey: ['role', id], queryFn: () => api.roles.get(id!) });
    const { data: rolePermissions } = useQuery({ queryKey: ['role-permissions', id], queryFn: () => api.roles.getPermissions(id!) });
    const { data: allPermissions } = useQuery({ queryKey: ['permissions'], queryFn: api.permissions.list });

    const assignMutation = useMutation({
        mutationFn: (permId: string) => api.assignments.assignPermission(id!, permId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions', id] });
            setSelectedPermission('');
        }
    });

    const revokeMutation = useMutation({
        mutationFn: (permId: string) => api.assignments.revokePermission(id!, permId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['role-permissions', id] })
    });

    const assignedPermissionIds = new Set(rolePermissions?.map((rp: any) => rp.permissionId));

    const handleAssign = () => {
        if (selectedPermission) assignMutation.mutate(selectedPermission);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Role: {role?.roleName}</Typography>
            <Typography color="textSecondary" mb={4}>{role?.description}</Typography>

            <Paper sx={{ p: 3, maxWidth: 600 }}>
                <Typography variant="h6" mb={2}>Assigned Permissions</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} mb={4}>
                    {rolePermissions?.map((rp: any) => {
                        const perm = allPermissions?.find((p: any) => p.permissionId === rp.permissionId);
                        return (
                            <Chip
                                key={rp.permissionId}
                                label={perm?.permissionName || rp.permissionId}
                                onDelete={() => revokeMutation.mutate(rp.permissionId)}
                            />
                        );
                    })}
                </Stack>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Assign Permission</InputLabel>
                        <Select
                            value={selectedPermission}
                            label="Assign Permission"
                            onChange={(e) => setSelectedPermission(e.target.value)}
                        >
                            {allPermissions?.filter((p: any) => !assignedPermissionIds.has(p.permissionId)).map((p: any) => (
                                <MenuItem key={p.permissionId} value={p.permissionId}>{p.permissionName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleAssign} disabled={!selectedPermission || assignMutation.isPending}>
                        Add
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
