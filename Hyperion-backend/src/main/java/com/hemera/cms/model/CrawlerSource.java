package com.hemera.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CrawlerSource {
    private UUID id;
    private String name;
    private String baseUrl;
    private Boolean enabled;
    private String extractionTemplateJson;
    private LocalDateTime createdAt;
}
