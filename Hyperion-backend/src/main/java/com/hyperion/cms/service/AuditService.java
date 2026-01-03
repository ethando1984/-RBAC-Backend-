package com.hyperion.cms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyperion.cms.security.PermissionService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuditService {

    private final JdbcTemplate jdbcTemplate;
    private final PermissionService permissionService;
    private final ObjectMapper objectMapper;

    public AuditService(JdbcTemplate jdbcTemplate, PermissionService permissionService, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.permissionService = permissionService;
        this.objectMapper = objectMapper;
    }

    @Async
    public void log(String actionType, String entityType, String entityId, Object oldValue, Object newValue) {
        try {
            String actorId = permissionService.getCurrentUserId();
            String actorEmail = permissionService.getCurrentUserEmail();
            String oldJson = oldValue != null ? objectMapper.writeValueAsString(oldValue) : null;
            String newJson = newValue != null ? objectMapper.writeValueAsString(newValue) : null;

            String sql = "INSERT INTO audit_logs (id, actor_user_id, actor_email, action_type, entity_type, entity_id, old_value_json, new_value_json, created_at) "
                    +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            jdbcTemplate.update(sql,
                    UUID.randomUUID(),
                    actorId,
                    actorEmail,
                    actionType,
                    entityType,
                    entityId,
                    oldJson,
                    newJson,
                    LocalDateTime.now());
        } catch (Exception e) {
            // Fallback: don't fail transaction if audit fails, but log to console
            System.err.println("Failed to write audit log: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void logDecision(com.hyperion.cms.security.PermissionDecision decision) {
        boolean isSensitive = isSensitiveAction(decision.getAction());
        if (!decision.isAllowed() || isSensitive) {
            String details = String.format("Namespace: %s, Action: %s, Category: %s, Source: %s, Reason: %s",
                    decision.getNamespace(), decision.getAction(), decision.getCategoryId(),
                    decision.getSource(), decision.getReasonCode());

            log("AUTH_DECISION", "PERMISSION",
                    decision.getResourceId() != null ? decision.getResourceId() : "N/A",
                    null, details);
        }
    }

    private boolean isSensitiveAction(String action) {
        if (action == null)
            return false;
        String lower = action.toLowerCase();
        return lower.contains("publish") || lower.contains("delete") || lower.contains("admin")
                || lower.contains("write");
    }
}
