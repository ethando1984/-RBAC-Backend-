package com.aitech.rbac.controller;

import com.aitech.rbac.model.Role;
import com.aitech.rbac.service.RoleService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleService service;

    public RoleController(RoleService service) {
        this.service = service;
    }

    @GetMapping
    public Object getAll(@RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search) {
        if (page == null && size == null) {
            return service.getAll();
        }
        return service.getAll(page != null ? page : 1, size != null ? size : 10, search);
    }

    @GetMapping("/{id}")
    public Role getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping
    public void create(@RequestBody Role entity) {
        service.create(entity);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable UUID id, @RequestBody Role entity) {
        entity.setRoleId(id);
        service.update(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
