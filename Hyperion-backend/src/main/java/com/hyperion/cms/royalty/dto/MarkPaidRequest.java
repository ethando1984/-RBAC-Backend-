package com.hyperion.cms.royalty.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MarkPaidRequest {
    private String paymentRef;
    private LocalDateTime paidAt;
}
