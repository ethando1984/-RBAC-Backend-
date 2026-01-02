package com.hemera.cms.controller;

import com.hemera.cms.mapper.ArticleMapper;
import com.hemera.cms.mapper.TaskMapper;
import com.hemera.cms.mapper.AuditLogMapper;
import com.hemera.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ArticleMapper articleMapper;
    private final TaskMapper taskMapper;
    private final AuditLogMapper auditLogMapper;
    private final PermissionService permissionService;

    public DashboardController(ArticleMapper articleMapper, TaskMapper taskMapper,
            AuditLogMapper auditLogMapper, PermissionService permissionService) {
        this.articleMapper = articleMapper;
        this.taskMapper = taskMapper;
        this.auditLogMapper = auditLogMapper;
        this.permissionService = permissionService;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        if (!permissionService.can("dashboard", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing dashboard:read permission");
        }

        Map<String, Object> stats = new HashMap<>();

        // Article stats
        Map<String, Integer> articleStats = new HashMap<>();
        articleStats.put("total", articleMapper.findAll(null, null, 10000, 0).size());
        articleStats.put("published", articleMapper.findAll("PUBLISHED", null, 10000, 0).size());
        articleStats.put("draft", articleMapper.findAll("DRAFT", null, 10000, 0).size());
        articleStats.put("pending", articleMapper.findAll("PENDING_EDITORIAL", null, 10000, 0).size());
        stats.put("articles", articleStats);

        // Task stats
        Map<String, Integer> taskStats = new HashMap<>();
        taskStats.put("total", taskMapper.findAll(null, null, null, null, 0, 10000).size());
        taskStats.put("todo", taskMapper.countByStatus("TODO"));
        taskStats.put("inProgress", taskMapper.countByStatus("IN_PROGRESS"));
        taskStats.put("completed", taskMapper.countByStatus("COMPLETED"));
        stats.put("tasks", taskStats);

        // Audit stats
        Map<String, Integer> auditStats = new HashMap<>();
        auditStats.put("total", auditLogMapper.findAll(null, null, null, 0, 10000).size());
        auditStats.put("articles", auditLogMapper.countByEntityType("article"));
        auditStats.put("users", auditLogMapper.countByEntityType("user"));
        stats.put("audit", auditStats);

        return stats;
    }

    @GetMapping("/recent-activity")
    public Map<String, Object> getRecentActivity() {
        if (!permissionService.can("dashboard", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing dashboard:read permission");
        }

        Map<String, Object> activity = new HashMap<>();
        activity.put("recentArticles", articleMapper.findAll(null, null, 5, 0));
        activity.put("recentTasks", taskMapper.findAll(null, null, null, null, 0, 5));
        activity.put("recentAuditLogs", auditLogMapper.findAll(null, null, null, 0, 10));

        return activity;
    }
}
