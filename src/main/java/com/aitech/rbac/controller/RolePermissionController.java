package com.aitech.rbac.controller;

import com.aitech.rbac.model.RolePermission;
import com.aitech.rbac.service.RolePermissionService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/role_permissions")
public class RolePermissionController {
    private final RolePermissionService service;
    public RolePermissionController(RolePermissionService service) { this.service = service; }

    @GetMapping public List<RolePermission> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public RolePermission getById(@PathVariable UUID id) { return service.getById(id); }
    @PostMapping public void create(@RequestBody RolePermission entity) { service.create(entity); }
    @PutMapping("/{id}") public void update(@PathVariable UUID id, @RequestBody RolePermission entity) { service.update(entity); }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { service.delete(id); }
}
