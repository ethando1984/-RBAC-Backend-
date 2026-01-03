package com.hyperion.cms.royalty.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoyaltyMediaFee {
    private String id;
    private String ruleSetId;
    private String mediaType; // IMAGE, VIDEO, GALLERY, INFOGRAPHIC
    private BigDecimal feeAmount;
    private String feeMode; // FLAT, PER_ITEM
    private BigDecimal maxFeeAmount;
}
