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
public class RoyaltyPaymentBatchItem {
    private String batchId;
    private String royaltyRecordId;
    private String authorId;
    private String authorEmail;
    private BigDecimal amount;
}
