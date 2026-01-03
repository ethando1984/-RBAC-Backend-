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
public class RoyaltyRecord {
    private String id; // UUID
    private String articleId;
    private String articleSlug;
    private String articleTitle;
    private String categoryId;
    private String categoryName;
    private String articleType; // SHORT_NEWS, NEWS, etc.
    private Integer wordCount;
    private String authorId;
    private String authorDisplayName;
    private String authorEmail;
    private String authorType; // INTERNAL, EXTERNAL
    private String authorLevel; // JUNIOR, SENIOR
    private LocalDateTime publishedAt;

    private String status; // RoyaltyStatus enum as string

    // JSON snapshot
    private String calcSnapshotJson;

    // Monetary fields
    private BigDecimal baseAmount;
    private BigDecimal multiplierFactor;
    private BigDecimal mediaFeeTotal;
    private BigDecimal bonusAmount;
    private BigDecimal grossAmount;
    private BigDecimal overrideAmount;
    private BigDecimal finalAmount;

    private String note;

    private LocalDateTime createdAt;
    private String createdByUserId;
    private String createdByEmail;
    private LocalDateTime updatedAt;
    private String updatedByUserId;
    private String updatedByEmail;

    public enum RoyaltyStatus {
        CALCULATED,
        EDITOR_CONFIRMED,
        MANAGER_APPROVED,
        FINANCE_APPROVED,
        PAID,
        REJECTED,
        VOIDED
    }
}
