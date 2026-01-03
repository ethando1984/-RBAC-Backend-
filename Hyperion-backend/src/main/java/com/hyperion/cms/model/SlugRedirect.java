package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SlugRedirect {
    private UUID id;
    private String entityType; // ARTICLE, CATEGORY, STORYLINE, TAG
    private UUID entityId;
    private String oldSlug;
    private String newSlug;
    private LocalDateTime createdAt;
}
