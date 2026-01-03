package com.hyperion.cms.royalty.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoyaltyApprovalHistory {
    private String id;
    private String royaltyRecordId;
    private String actionType; // AUTO_CALCULATED, EDITOR_CONFIRMED...
    private String actorUserId;
    private String actorEmail;
    private String oldStatus;
    private String newStatus;
    private BigDecimal oldAmount;
    private BigDecimal newAmount;
    private String reasonNote;
    private LocalDateTime createdAt;
    private String correlationId;
    private String ipAddress;

    public enum ActionType {
        AUTO_CALCULATED,
        EDITOR_CONFIRMED,
        MANAGER_APPROVED,
        FINANCE_APPROVED,
        MARK_PAID,
        REJECT,
        OVERRIDE_AMOUNT,
        VOIDED
    }
}
