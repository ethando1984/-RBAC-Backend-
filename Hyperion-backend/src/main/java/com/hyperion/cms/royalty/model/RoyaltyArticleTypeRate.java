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
public class RoyaltyArticleTypeRate {
    private String id;
    private String ruleSetId;
    private String articleType; // SHORT_NEWS, NEWS, etc.
    private BigDecimal baseAmount;
}
