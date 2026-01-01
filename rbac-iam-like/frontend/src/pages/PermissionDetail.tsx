import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Box, Typography, Button, Paper, Stack, MenuItem, Select, FormControl, InputLabel, Divider } from '@mui/material';
import { useState } from 'react';

export default function PermissionDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [selectedNamespace, setSelectedNamespace] = useState('');
    const [selectedAction, setSelectedAction] = useState('');

    const { data: permission } = useQuery({ queryKey: ['permission', id], queryFn: () => api.permissions.get(id!) });
    const { data: resourceAccessList } = useQuery({ queryKey: ['resource-access', id], queryFn: () => api.permissions.getResourceAccess(id!) });

    const { data: namespaces } = useQuery({ queryKey: ['namespaces'], queryFn: api.namespaces.list });
    const { data: actionTypes } = useQuery({ queryKey: ['action-types'], queryFn: api.actionTypes.list });

    const assignMutation = useMutation({
        mutationFn: (data: { namespaceId: string, actionTypeId: string }) =>
            api.assignments.assignResourceAccess({ permissionId: id!, ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-access', id] });
            setSelectedNamespace('');
            setSelectedAction('');
        }
    });

    const revokeMutation = useMutation({
        mutationFn: (data: { namespaceId: string, actionTypeId: string }) =>
            api.assignments.revokeResourceAccess({ permissionId: id!, ...data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resource-access', id] })
    });

    const handleAssign = () => {
        if (selectedNamespace && selectedAction) {
            assignMutation.mutate({ namespaceId: selectedNamespace, actionTypeId: selectedAction });
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Permission: {permission?.permissionName}</Typography>
            <Typography color="textSecondary" mb={4}>{permission?.description}</Typography>

            <Paper sx={{ p: 3, maxWidth: 800 }}>
                <Typography variant="h6" mb={2}>Resource Access Mappings</Typography>
                <Typography variant="body2" color="textSecondary" mb={3}>
                    Define which Namespace and Action this permission grants access to.
                </Typography>

                <Stack spacing={2} mb={4}>
                    {resourceAccessList?.map((ra: any, index: number) => {
                        const ns = namespaces?.find((n: any) => n.namespaceId === ra.namespaceId);
                        const act = actionTypes?.find((a: any) => a.actionTypeId === ra.actionTypeId);
                        return (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, border: '1px solid #30363d', borderRadius: 1 }}>
                                <Typography sx={{ flexGrow: 1 }}>
                                    <strong>Namespace:</strong> {ns?.namespaceKey || 'Unknown'}
                                    <Divider orientation="vertical" flexItem sx={{ display: 'inline', mx: 2 }} />
                                    <strong>Action:</strong> {act?.actionKey || 'Unknown'}
                                </Typography>
                                <Button size="small" color="error" onClick={() => revokeMutation.mutate({ namespaceId: ra.namespaceId, actionTypeId: ra.actionTypeId })}>
                                    Revoke
                                </Button>
                            </Box>
                        );
                    })}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" mb={2}>Add New Mapping</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Namespace</InputLabel>
                        <Select
                            value={selectedNamespace}
                            label="Namespace"
                            onChange={(e) => setSelectedNamespace(e.target.value)}
                        >
                            {namespaces?.map((n: any) => (
                                <MenuItem key={n.namespaceId} value={n.namespaceId}>{n.namespaceKey}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Action</InputLabel>
                        <Select
                            value={selectedAction}
                            label="Action"
                            onChange={(e) => setSelectedAction(e.target.value)}
                        >
                            {actionTypes?.map((a: any) => (
                                <MenuItem key={a.actionTypeId} value={a.actionTypeId}>{a.actionKey}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={!selectedNamespace || !selectedAction || assignMutation.isPending}
                        sx={{ minWidth: 100 }}
                    >
                        Add
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
