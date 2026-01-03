package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class Category {
    private UUID id;
    private UUID parentId;
    private String name;
    private String slug;
    private String seoTitle;
    private String seoDescription;
    private String positionConfigJson;
    private String redirectTo; // Transient field for slug redirects
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
