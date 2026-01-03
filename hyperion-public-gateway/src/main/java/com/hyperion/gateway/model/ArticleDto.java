package com.hyperion.gateway.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class ArticleDto {
    private UUID id;
    private String title;
    private String subtitle;
    private String slug;
    private String contentHtml;
    private String excerpt;
    private String coverMediaUrl;
    private List<MediaVariant> mediaVariants;
    private String sourceName;
    private String sourceUrl;

    private String seoTitle;
    private String seoDescription;
    private String canonicalUrl;

    private LocalDateTime publishedAt;
    private List<UUID> categoryIds;
    private List<String> tagNames;
    private List<CategoryDto> categories;
    private List<TagDto> tags;
    private AuthorDto author;
    private String redirectTo;
    private String canonicalSlug;

    private Integer readTime; // Computed

    @Data
    public static class MediaVariant {
        private String type; // hero, thumbnail, medium, small
        private String url;
        private Integer width;
        private Integer height;
    }
}
