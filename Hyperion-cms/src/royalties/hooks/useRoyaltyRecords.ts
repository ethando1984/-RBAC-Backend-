import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { royaltyApi } from '../api/royaltyApi';

export const useRoyaltyRecords = (params: { month?: string, status?: string, author?: string, page?: number, pageSize?: number }) => {
    return useQuery({
        queryKey: ['royalty-records', params],
        queryFn: () => royaltyApi.getRecords(params),
        placeholderData: (previousData) => previousData,
    });
};

export const useRoyaltyRecord = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['royalty-record', id],
        queryFn: () => royaltyApi.getRecord(id),
        enabled
    });
};

export const useRoyaltyHistory = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['royalty-history', id],
        queryFn: () => royaltyApi.getRecordHistory(id),
        enabled
    });
};

export const useRoyaltyActions = () => {
    const queryClient = useQueryClient();

    const invalidate = (id?: string) => {
        if (id) {
            queryClient.invalidateQueries({ queryKey: ['royalty-record', id] });
            queryClient.invalidateQueries({ queryKey: ['royalty-history', id] });
        }
        queryClient.invalidateQueries({ queryKey: ['royalty-records'] });
    };

    const confirm = useMutation({
        mutationFn: (id: string) => royaltyApi.editorConfirm(id),
        onSuccess: (_, id) => invalidate(id)
    });

    const approveManager = useMutation({
        mutationFn: (id: string) => royaltyApi.managerApprove(id),
        onSuccess: (_, id) => invalidate(id)
    });

    const approveFinance = useMutation({
        mutationFn: (id: string) => royaltyApi.financeApprove(id),
        onSuccess: (_, id) => invalidate(id)
    });

    const markPaid = useMutation({
        mutationFn: (vars: { id: string, paymentRef: string, paidAt: string }) => royaltyApi.markPaid(vars.id, { paymentRef: vars.paymentRef, paidAt: vars.paidAt }),
        onSuccess: (_, vars) => invalidate(vars.id)
    });

    const reject = useMutation({
        mutationFn: (vars: { id: string, reason: string }) => royaltyApi.reject(vars.id, vars.reason),
        onSuccess: (_, vars) => invalidate(vars.id)
    });

    const override = useMutation({
        mutationFn: (vars: { id: string, amount: number, note: string }) => royaltyApi.override(vars.id, { finalAmount: vars.amount, note: vars.note }),
        onSuccess: (_, vars) => invalidate(vars.id)
    });

    return {
        confirm,
        approveManager,
        approveFinance,
        markPaid,
        reject,
        override
    };
};
