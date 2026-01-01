package com.aitech.rbac.model;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class Order {
    private UUID orderId;
    private String customerName;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime orderDate;
}
