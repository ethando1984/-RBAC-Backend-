package com.aitech.rbac.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PolicyVersion {
    private UUID versionId;
    private UUID permissionId;
    private Integer versionNumber;
    private Boolean isDefault;
    private String documentJson;
    private LocalDateTime createdAt;
    private String createdBy;
}
