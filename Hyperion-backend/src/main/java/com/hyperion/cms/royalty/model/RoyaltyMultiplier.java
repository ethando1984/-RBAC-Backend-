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
public class RoyaltyMultiplier {
    private String id;
    private String ruleSetId;
    private String multiplierType; // EXCLUSIVE, BREAKING, OUT_OF_HOURS, HOLIDAY, AUTHOR_LEVEL, CATEGORY_LEVEL
    private String keyName; // "exclusive", "holiday", "senior"
    private BigDecimal factor;
}
