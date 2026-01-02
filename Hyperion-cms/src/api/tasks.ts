import { hemeraApi } from './client';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedToUserId?: string;
    assignedToEmail?: string;
    articleId?: string;
    dueDate?: string;
    completedAt?: string;
    createdByUserId?: string;
    createdByEmail?: string;
    updatedByUserId?: string;
    updatedByEmail?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const taskApi = {
    list: (params?: { status?: string; assignedToUserId?: string; createdByUserId?: string; articleId?: string; page?: number; size?: number }) =>
        hemeraApi.get<Task[]>('/tasks', { params }).then(res => res.data),
    get: (id: string) => hemeraApi.get<Task>(`/tasks/${id}`).then(res => res.data),
    create: (task: Partial<Task>) => hemeraApi.post<Task>('/tasks', task).then(res => res.data),
    update: (id: string, task: Partial<Task>) => hemeraApi.put<Task>(`/tasks/${id}`, task).then(res => res.data),
    updateStatus: (id: string, status: Task['status']) => hemeraApi.patch<Task>(`/tasks/${id}/status`, null, { params: { status } }).then(res => res.data),
    delete: (id: string) => hemeraApi.delete(`/tasks/${id}`),
    getStats: () => hemeraApi.get<Record<string, number>>('/tasks/stats').then(res => res.data),
};
