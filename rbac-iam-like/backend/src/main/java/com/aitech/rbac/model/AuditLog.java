package com.aitech.rbac.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AuditLog {
    private UUID logId;
    private UUID actorUserId;
    private String actorEmail;
    private String actionType; // POLICY_CREATE, ROLE_ATTACH_POLICY, etc
    private String entityType; // POLICY, ROLE, USER
    private String entityId;
    private String oldValueJson;
    private String newValueJson;
    private Integer affectedRolesCount;
    private Integer affectedUsersCount;
    private LocalDateTime createdAt;
    private String ipAddress;
    private String correlationId;
}
