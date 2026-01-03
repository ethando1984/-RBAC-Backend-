package com.hyperion.gateway.model;

import lombok.Data;
import java.util.List;

@Data
public class HomeResponse {
    private Object layout;
    private List<ArticleDto> feed;
    private List<ArticleDto> staffPicks;
    private List<CategoryDto> recommendedTopics;
}
