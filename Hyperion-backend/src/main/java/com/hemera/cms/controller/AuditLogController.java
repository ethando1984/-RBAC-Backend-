package com.hemera.cms.controller;

import com.hemera.cms.mapper.AuditLogMapper;
import com.hemera.cms.model.AuditLog;
import com.hemera.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogMapper auditLogMapper;
    private final PermissionService permissionService;

    public AuditLogController(AuditLogMapper auditLogMapper, PermissionService permissionService) {
        this.auditLogMapper = auditLogMapper;
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<AuditLog> list(
            @RequestParam(required = false) String actorUserId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (!permissionService.can("audit", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing audit:read permission");
        }
        return auditLogMapper.findAll(actorUserId, entityType, entityId, page * size, size);
    }

    @GetMapping("/{id}")
    public AuditLog get(@PathVariable UUID id) {
        if (!permissionService.can("audit", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing audit:read permission");
        }
        AuditLog log = auditLogMapper.findById(id);
        if (log == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return log;
    }

    @GetMapping("/stats")
    public Map<String, Integer> getStats() {
        if (!permissionService.can("audit", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing audit:read permission");
        }
        return Map.of(
                "articles", auditLogMapper.countByEntityType("article"),
                "users", auditLogMapper.countByEntityType("user"),
                "categories", auditLogMapper.countByEntityType("category"),
                "total", auditLogMapper.findAll(null, null, null, 0, Integer.MAX_VALUE).size());
    }
}
