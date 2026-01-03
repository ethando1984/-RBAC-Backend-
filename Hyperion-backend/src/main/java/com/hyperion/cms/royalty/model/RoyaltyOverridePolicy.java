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
public class RoyaltyOverridePolicy {
    private String id;
    private String ruleSetId;
    private BigDecimal editorOverrideMaxPercent;
    private BigDecimal managerOverrideMaxPercent;
    private boolean requireNoteForOverride;
    private boolean allowManualBaseRateOverride;
}
