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
public class RoyaltyPaymentBatch {
    private String id;
    private String monthKey; // YYYY-MM
    private String status; // DRAFT, APPROVED, PAID, CANCELLED
    private Integer totalItems;
    private BigDecimal totalAmount;

    private LocalDateTime createdAt;
    private String createdByUserId;
    private String createdByEmail;

    private LocalDateTime approvedAt;
    private String approvedByUserId;
    private String approvedByEmail;

    private LocalDateTime paidAt;
    private String paidByUserId;
    private String paymentRef;
    private String exportFileKey;
}
