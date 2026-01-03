package com.hyperion.gateway.model;

import lombok.Data;
import java.util.UUID;

@Data
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class CategoryDto {
    private UUID id;
    private UUID parentId;
    private String name;
    private String slug;
    private String description;
    private String redirectTo;
    private String canonicalSlug;
}
