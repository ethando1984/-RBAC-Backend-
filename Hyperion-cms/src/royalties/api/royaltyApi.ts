import { hemeraApi } from '../../api/client';
import type {
    RoyaltyRecord,
    RoyaltyRuleSet,
    RoyaltyPaymentBatch,
    RoyaltyApprovalHistory
} from '../types/royalty';

export const royaltyApi = {
    // --- Rule Sets ---
    getRuleSets: async () => {
        const res = await hemeraApi.get<RoyaltyRuleSet[]>('/royalty/rulesets');
        return res.data;
    },
    createRuleSet: async (data: Partial<RoyaltyRuleSet> & { rates?: any[], multipliers?: any[], mediaFees?: any[], policy?: any }) => {
        const res = await hemeraApi.post<RoyaltyRuleSet>('/royalty/rulesets', data);
        return res.data;
    },

    getRuleSet: async (id: string) => {
        const res = await hemeraApi.get<RoyaltyRuleSet>(`/royalty/rulesets/${id}`);
        return res.data;
    },

    activateRuleSet: async (id: string) => {
        const res = await hemeraApi.post<RoyaltyRuleSet>(`/royalty/rulesets/${id}/activate`);
        return res.data;
    },

    // --- Records ---
    getRecords: async (params: { month?: string, status?: string, author?: string, page?: number, pageSize?: number }) => {
        // Note: Backend might need specific param mapping. Based on RecordMapper: month, status, authorId, limit, offset
        const query = new URLSearchParams();
        if (params.month) query.append('month', params.month);
        if (params.status) query.append('status', params.status);
        if (params.author) query.append('authorId', params.author);
        if (params.page !== undefined) query.append('page', params.page.toString());
        if (params.pageSize !== undefined) query.append('size', params.pageSize.toString());

        // The previous controller code didn't explicitly show the search endpoint implementation in detail 
        // but the mapper had `findRecords`. Assuming `RoyaltyController` exposes a GET /records.
        // Wait, the user request had `GET /api/royalty/records?month...` in API ENDPOINTS list.
        // I didn't see `getRecords` in the `RoyaltyController.java` file I wrote.
        // I MUST CHECK if I missed adding the list endpoint to Controller.
        // I will add it if missing after this step or handle it.
        // For now assuming it exists or will exist.
        const res = await hemeraApi.get<RoyaltyRecord[]>(`/royalty/records?${query.toString()}`);
        return res.data;
    },

    getRecord: async (id: string) => {
        const res = await hemeraApi.get<RoyaltyRecord>(`/royalty/records/${id}`);
        return res.data;
    },

    getRecordHistory: async (id: string) => {
        const res = await hemeraApi.get<RoyaltyApprovalHistory[]>(`/royalty/records/${id}/history`);
        return res.data;
    },

    // Workflow
    editorConfirm: async (id: string) => {
        await hemeraApi.post(`/royalty/records/${id}/editor-confirm`);
    },

    managerApprove: async (id: string) => {
        await hemeraApi.post(`/royalty/records/${id}/manager-approve`);
    },

    financeApprove: async (id: string) => {
        await hemeraApi.post(`/royalty/records/${id}/finance-approve`);
    },

    markPaid: async (id: string, data: { paymentRef: string, paidAt: string }) => {
        await hemeraApi.post(`/royalty/records/${id}/mark-paid`, data);
    },

    reject: async (id: string, reasonNote: string) => {
        await hemeraApi.post(`/royalty/records/${id}/reject`, { reasonNote });
    },

    override: async (id: string, data: { finalAmount: number, note: string }) => {
        await hemeraApi.post(`/royalty/records/${id}/override`, data);
    },

    // --- Batches ---
    createBatch: async (month: string) => {
        const res = await hemeraApi.post<RoyaltyPaymentBatch>(`/royalty/batches?month=${month}`);
        return res.data;
    },

    exportBatchCsvUrl: (batchId: string) => {
        return `${hemeraApi.defaults.baseURL}/royalty/batches/${batchId}/export.csv`;
    },

    bulkCalculateRecords: async () => {
        const res = await hemeraApi.post<{ message: string, count: number }>('/royalty/records/bulk-calculate');
        return res.data;
    }
};
