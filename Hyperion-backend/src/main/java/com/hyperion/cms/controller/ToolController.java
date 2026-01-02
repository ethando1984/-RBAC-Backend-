package com.hyperion.cms.controller;

import com.hyperion.cms.security.PermissionService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
public class ToolController {

    private final PermissionService permissionService;

    public ToolController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/api/crawler/jobs")
    public List<Map<String, Object>> getCrawlerJobs() {
        if (!permissionService.can("crawler", "manage"))
            throw new AccessDeniedException("Access Denied");
        return List.of();
    }

}
