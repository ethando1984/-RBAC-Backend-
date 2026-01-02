package com.aitech.rbac.controller;

import com.aitech.rbac.model.Permission;
import com.aitech.rbac.service.PermissionService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {
    private final PermissionService service;

    public PermissionController(PermissionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Permission> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Permission getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping
    public void create(@RequestBody Permission entity) {
        service.create(entity);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable UUID id, @RequestBody Permission entity) {
        entity.setPermissionId(id);
        service.update(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
