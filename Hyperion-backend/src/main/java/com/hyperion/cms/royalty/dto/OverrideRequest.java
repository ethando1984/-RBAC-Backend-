package com.hyperion.cms.royalty.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OverrideRequest {
    private BigDecimal finalAmount;
    private String note;
}
