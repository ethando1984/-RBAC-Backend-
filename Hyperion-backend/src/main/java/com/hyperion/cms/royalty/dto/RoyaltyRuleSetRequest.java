package com.hyperion.cms.royalty.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RoyaltyRuleSetRequest {
    private String name;
    private String currency;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;

    private List<RateDto> rates;
    private List<MultiplierDto> multipliers;
    private List<MediaFeeDto> mediaFees;
    private PolicyDto policy;

    @Data
    public static class RateDto {
        private String articleType;
        private BigDecimal baseAmount;
    }

    @Data
    public static class MultiplierDto {
        private String multiplierType;
        private String keyName;
        private BigDecimal factor;
    }

    @Data
    public static class MediaFeeDto {
        private String mediaType;
        private BigDecimal feeAmount;
        private String feeMode;
        private BigDecimal maxFeeAmount;
    }

    @Data
    public static class PolicyDto {
        private BigDecimal editorOverrideMaxPercent;
        private BigDecimal managerOverrideMaxPercent;
        private boolean requireNoteForOverride;
        private boolean allowManualBaseRateOverride;
    }
}
