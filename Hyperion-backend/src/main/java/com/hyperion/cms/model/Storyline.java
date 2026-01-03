package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Data
public class Storyline {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String status; // ONGOING, ARCHIVED

    private String contentsJson;
    private String layoutJson;
    private String seoTitle;
    private String seoDescription;

    private String createdByUserId;
    private String createdByEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String redirectTo; // Transient field for slug redirects

    // Transient fields
    private Integer articleCount;
    private List<UUID> articleIds;
    private List<Article> articles;
    private List<StorylineMedia> media;

    @Data
    public static class StorylineMedia {
        private UUID storylineId;
        private UUID mediaId;
        private String role; // HERO, GALLERY, ATTACHMENT
        private Integer sortOrder;

        // Joined fields
        private String mediaUrl;
        private String mediaType;
    }
}
