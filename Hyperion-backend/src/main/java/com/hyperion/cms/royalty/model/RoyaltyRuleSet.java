package com.hyperion.cms.royalty.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoyaltyRuleSet {
    private String id;
    private String name;
    private String status; // ACTIVE, INACTIVE
    private String currency;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;

    private LocalDateTime createdAt;
    private String createdByUserId;
    private String createdByEmail;
    private LocalDateTime updatedAt;
    private String updatedByUserId;
    private String updatedByEmail;
}
