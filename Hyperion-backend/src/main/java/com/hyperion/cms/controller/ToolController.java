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

}
