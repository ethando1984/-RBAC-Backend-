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
    private final UserService userService; // To resolve user details if needed
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditServiceImpl(AuditLogMapper auditLogMapper, UserService userService) {
        this.auditLogMapper = auditLogMapper;
        this.userService = userService;
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
            String username = auth.getName();
            log.setActorEmail(username); // Assuming username is email or can lookup
            try {
                User user = userService.findByUsername(username);
                if (user != null) {
                    log.setActorUserId(user.getUserId());
                    log.setActorEmail(user.getEmail());
                }
            } catch (Exception ignored) {
            }
        } else {
            log.setActorEmail("SYSTEM");
        }

        // IP Address (would ideally come from request context or filter)
        log.setIpAddress("127.0.0.1");

        auditLogMapper.insert(log);
    }

    @Override
    public List<AuditLog> getLogs(String entityType, String actionType, String fromDate, String toDate) {
        return auditLogMapper.findAll(entityType, actionType, fromDate, toDate);
    }
}
