package com.aitech.rbac.controller;

import com.aitech.rbac.model.RolePermission;
import com.aitech.rbac.service.RolePermissionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/role_permissions")
public class RolePermissionController {
    private final RolePermissionService service;
    public RolePermissionController(RolePermissionService service) { this.service = service; }

    @PostMapping
    public void create(@RequestBody RolePermission entity) {
        service.create(entity);
    }

    @DeleteMapping
    public void delete(@RequestBody RolePermission entity) {
        service.delete(entity);
    }
}
