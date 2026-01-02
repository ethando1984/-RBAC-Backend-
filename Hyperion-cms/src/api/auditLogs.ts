import { hemeraApi } from './client';

export interface AuditLog {
    id: string;
    actorUserId?: string;
    actorEmail?: string;
    actionType: string;
    entityType?: string;
    entityId?: string;
    oldValueJson?: string;
    newValueJson?: string;
    createdAt: string;
    ipAddress?: string;
    correlationId?: string;
}

export const auditLogApi = {
    list: (params?: { actorUserId?: string; entityType?: string; entityId?: string; page?: number; size?: number }) =>
        hemeraApi.get<AuditLog[]>('/audit-logs', { params }).then(res => res.data),
    get: (id: string) => hemeraApi.get<AuditLog>(`/audit-logs/${id}`).then(res => res.data),
    getStats: () => hemeraApi.get<Record<string, number>>('/audit-logs/stats').then(res => res.data),
};
