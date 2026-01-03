package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CrawlerResult {
    private UUID id;
    private UUID jobId;
    private String url;
    private String extractedTitle;
    private String extractedHtml;
    private String extractedMetaJson;
    private String reviewStatus; // PENDING, APPROVED, REJECTED, CONVERTED
    private String reviewedByUserId;
    private String reviewedByEmail;
    private LocalDateTime reviewedAt;
}
