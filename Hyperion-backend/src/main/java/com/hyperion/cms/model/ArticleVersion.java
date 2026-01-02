package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ArticleVersion {
    private UUID id;
    private UUID articleId;
    private Integer versionNumber;
    private String snapshotJson;
    private String diffSummary;
    private String statusAtThatTime;
    private String editedByUserId;
    private String editedByEmail;
    private LocalDateTime editedAt;
}
