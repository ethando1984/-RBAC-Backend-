package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class Article {
    private UUID id;
    private String title;
    private String subtitle;
    private String slug;
    private String contentHtml;
    private String excerpt;
    private UUID coverMediaId;
    private String coverMediaUrl; // Transient field for frontend display
    private String sourceName;
    private String sourceUrl;

    // SEO
    private String seoTitle;
    private String seoDescription;
    private String canonicalUrl;
    private String robots;

    private ArticleStatus status;
    private String visibility; // PUBLIC, PRIVATE, PASSWORD
    private LocalDateTime scheduledAt;
    private LocalDateTime publishedAt;

    private java.util.List<UUID> categoryIds;
    private UUID primaryCategoryId;
    private java.util.List<String> tagNames; // For quick management
    private java.util.List<UUID> tagIds;

    private String createdByUserId;
    private String createdByEmail;
    private String authorUserId;
    private String authorRoleId;
    private String updatedByUserId;
    private String updatedByEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum ArticleStatus {
        DRAFT, PENDING_EDITORIAL, PENDING_PUBLISHING, SCHEDULED, PUBLISHED, REJECTED, ARCHIVED
    }
}
