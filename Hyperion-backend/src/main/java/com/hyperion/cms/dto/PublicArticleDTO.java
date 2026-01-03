package com.hyperion.cms.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class PublicArticleDTO {
    private UUID id;
    private String title;
    private String subtitle;
    private String slug;
    private String excerpt;
    private String coverMediaUrl;
    private String authorName;
    private String authorAvatar;
    private String authorUserId;
    private LocalDateTime publishedAt;
    private Integer readTimeMinutes;
    private Integer likes;
    private Integer comments;
    private List<String> tags;
    private String primaryCategoryName;

    // Computed field
    public Integer getReadTimeMinutes() {
        if (readTimeMinutes == null && excerpt != null) {
            // Estimate: ~200 words per minute
            int wordCount = excerpt.split("\\s+").length;
            return Math.max(1, wordCount / 200);
        }
        return readTimeMinutes != null ? readTimeMinutes : 1;
    }
}
