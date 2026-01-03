package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.AuditLogMapper;
import com.aitech.rbac.model.AuditLog;
import com.aitech.rbac.service.AuditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Or your UserPrincipal
import org.springframework.stereotype.Service;
import com.aitech.rbac.service.UserService;
import com.aitech.rbac.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogMapper auditLogMapper;
    // Removed UserService to break circular dependency
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditServiceImpl(AuditLogMapper auditLogMapper) {
        this.auditLogMapper = auditLogMapper;
    }

    @Override
    public void logAction(String actionType, String entityType, String entityId, Object oldValue, Object newValue,
            Integer affectedRoles, Integer affectedUsers) {
        AuditLog log = new AuditLog();
        log.setLogId(UUID.randomUUID());
        log.setCreatedAt(LocalDateTime.now());
        log.setActionType(actionType);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAffectedRolesCount(affectedRoles != null ? affectedRoles : 0);
        log.setAffectedUsersCount(affectedUsers != null ? affectedUsers : 0);

        try {
            if (oldValue != null)
                log.setOldValueJson(objectMapper.writeValueAsString(oldValue));
            if (newValue != null)
                log.setNewValueJson(objectMapper.writeValueAsString(newValue));
        } catch (Exception e) {
            log.setNewValueJson("Error serializing values: " + e.getMessage());
        }

        // Capture Actor
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {

            if (auth instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken jwtAuth) {
                String sub = jwtAuth.getToken().getSubject();
                String email = (String) jwtAuth.getToken().getClaims().get("email");

                if (sub != null) {
                    try {
                        log.setActorUserId(UUID.fromString(sub));
                    } catch (IllegalArgumentException e) {
                        // ignore
                    }
                }
                log.setActorEmail(email != null ? email : auth.getName());
            } else {
                log.setActorEmail(auth.getName());
            }
        } else {
            log.setActorEmail("SYSTEM");
        }

        // IP Address (would ideally come from request context or filter)
        log.setIpAddress("127.0.0.1");

        auditLogMapper.insert(log);
    }

    @Override
    public void logDecision(com.aitech.rbac.security.PermissionDecision decision) {
        boolean isSensitive = isSensitiveAction(decision.getAction());
        if (!decision.isAllowed() || isSensitive) {
            String details = String.format("Namespace: %s, Action: %s, Category: %s, Source: %s, Reason: %s",
                    decision.getNamespace(), decision.getAction(), decision.getCategoryId(),
                    decision.getSource(), decision.getReasonCode());

            logAction("AUTH_DECISION", "PERMISSION",
                    decision.getResourceId() != null ? decision.getResourceId() : "N/A",
                    null, details, null, null);
        }
    }

    private boolean isSensitiveAction(String action) {
        if (action == null)
            return false;
        String lower = action.toLowerCase();
        return lower.contains("publish") || lower.contains("delete") || lower.contains("admin")
                || lower.contains("write");
    }

    @Override
    public List<AuditLog> getLogs(String entityType, String actionType, String fromDate, String toDate) {
        return auditLogMapper.findAll(entityType, actionType, fromDate, toDate);
    }
}
