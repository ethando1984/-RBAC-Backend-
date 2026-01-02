package com.hemera.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AuditLog {
    private UUID id;
    private String actorUserId;
    private String actorEmail;
    private String actionType;
    private String entityType;
    private String entityId;
    private String oldValueJson;
    private String newValueJson;
    private LocalDateTime createdAt;
    private String ipAddress;
    private String correlationId;
}
