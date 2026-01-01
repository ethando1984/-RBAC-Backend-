package com.aitech.rbac.model;

import lombok.Data;
import java.util.UUID;
import java.math.BigDecimal;

@Data
public class Product {
    private UUID productId;
    private String productName;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
    private String category;
}
