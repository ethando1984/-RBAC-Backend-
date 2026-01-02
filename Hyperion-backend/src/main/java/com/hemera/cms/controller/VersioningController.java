package com.hemera.cms.controller;

import com.hemera.cms.security.PermissionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles/{articleId}/versions")
public class VersioningController {

    private final PermissionService permissionService;

    public VersioningController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<Map<String, Object>> listVersions(@PathVariable UUID articleId) {
        // Todo: Implement DB logic
        return List.of();
    }

    @PostMapping("/{versionId}/restore")
    public void restore(@PathVariable UUID articleId, @PathVariable UUID versionId) {
        if (!permissionService.can("articles", "write")) {
            throw new RuntimeException("Access Denied");
        }
        // Logic to restore version
    }
}
