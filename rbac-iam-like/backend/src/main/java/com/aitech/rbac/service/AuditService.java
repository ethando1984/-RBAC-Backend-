package com.aitech.rbac.service;

import com.aitech.rbac.model.AuditLog;
import java.util.List;

public interface AuditService {
    void logAction(String actionType, String entityType, String entityId, Object oldValue, Object newValue,
            Integer affectedRoles, Integer affectedUsers);

    List<AuditLog> getLogs(String entityType, String actionType, String fromDate, String toDate);
}
