package com.hemera.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class Tag {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private LocalDateTime createdAt;
}
