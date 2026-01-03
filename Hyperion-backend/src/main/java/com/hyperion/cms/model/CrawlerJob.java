package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CrawlerJob {
    private UUID id;
    private UUID sourceId;
    private String status; // RUNNING, COMPLETED, FAILED
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String createdByUserId;
    private String createdByEmail;
}
