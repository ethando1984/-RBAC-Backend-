package com.hyperion.gateway.model;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class StorylineDto {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String status;
    private Integer articleCount;
    private String updatedAt; // Gateway handles dates as Strings usually or via mapper
    private String contentsJson;
    private String redirectTo;
    private String canonicalSlug;
    private List<ArticleDto> articles;
}
