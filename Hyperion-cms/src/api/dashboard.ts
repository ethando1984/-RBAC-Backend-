import { hemeraApi } from './client';
import type { Article } from './articles';
import type { Task } from './tasks';
import type { AuditLog } from './auditLogs';

export interface DashboardStats {
    articles: {
        total: number;
        published: number;
        draft: number;
        pending: number;
    };
    tasks: {
        total: number;
        todo: number;
        inProgress: number;
        completed: number;
    };
    audit: {
        total: number;
        articles: number;
        users: number;
    };
}

export interface RecentActivity {
    recentArticles: Article[];
    recentTasks: Task[];
    recentAuditLogs: AuditLog[];
}

export const dashboardApi = {
    getStats: () => hemeraApi.get<DashboardStats>('/dashboard/stats').then(res => res.data),
    getRecentActivity: () => hemeraApi.get<RecentActivity>('/dashboard/recent-activity').then(res => res.data),
};
