export const RoyaltyStatus = {
    CALCULATED: 'CALCULATED',
    EDITOR_CONFIRMED: 'EDITOR_CONFIRMED',
    MANAGER_APPROVED: 'MANAGER_APPROVED',
    FINANCE_APPROVED: 'FINANCE_APPROVED',
    PAID: 'PAID',
    REJECTED: 'REJECTED',
    VOIDED: 'VOIDED'
} as const;

export type RoyaltyStatus = typeof RoyaltyStatus[keyof typeof RoyaltyStatus];

export interface RoyaltyRecord {
    id: string;
    articleId: string;
    articleSlug: string;
    articleTitle: string;
    categoryId: string;
    categoryName: string;
    articleType: string;
    wordCount: number;
    authorId: string;
    authorDisplayName: string;
    authorEmail: string;
    authorType: string;
    authorLevel?: string;
    publishedAt: string;
    status: RoyaltyStatus;
    baseAmount: number;
    multiplierFactor: number;
    mediaFeeTotal: number;
    bonusAmount?: number;
    grossAmount: number;
    overrideAmount?: number;
    finalAmount: number;
    note?: string;
    calcSnapshotJson?: string;
    createdAt: string;
    createdByUserId?: string;
    updatedAt: string;
    updatedByUserId?: string;
}

export interface RoyaltyApprovalHistory {
    id: string;
    royaltyRecordId: string;
    actionType: string;
    actorUserId: string;
    actorEmail: string;
    oldStatus?: string;
    newStatus?: string;
    oldAmount?: number;
    newAmount?: number;
    reasonNote?: string;
    createdAt: string;
}

export interface RoyaltyRuleSet {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoyaltyPaymentBatch {
    id: string;
    monthKey: string;
    status: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
    totalItems: number;
    totalAmount: number;
    createdAt: string;
    approvedAt?: string;
    paidAt?: string;
    paymentRef?: string;
    exportFileKey?: string;
}

export interface RoyaltyPaymentBatchItem {
    batchId: string;
    royaltyRecordId: string;
    authorId: string;
    authorEmail: string;
    amount: number;
}

export interface RoyaltyStats {
    totalAmount: number;
    pendingEditor: number;
    pendingManager: number;
    pendingFinance: number;
    paidAmount: number;
}

export interface CategoryRoyaltyStat {
    categoryName: string;
    totalAmount: number;
}
