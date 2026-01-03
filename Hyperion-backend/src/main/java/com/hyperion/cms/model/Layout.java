package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class Layout {
    public enum LayoutType {
        STANDALONE, // A standalone landing page
        HOMEPAGE, // The site homepage
        CATEGORY, // Layout for a specific category or all categories
        ARTICLE, // Layout for a specific article or all articles
        EMBED // A partial layout to be embedded inside other content
    }

    private UUID id;
    private String name;
    private String slug; // Only for STANDALONE
    private LayoutType type;
    private String targetId; // nullable, e.g. CategoryUUID or ArticleUUID
    private String configJson; // The main layout definition (zones, widgets)
    private boolean isDefault; // If true, applies to all items of this type (e.g. default Article layout)
    private boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByUserId;
    private String updatedByUserId;
}
