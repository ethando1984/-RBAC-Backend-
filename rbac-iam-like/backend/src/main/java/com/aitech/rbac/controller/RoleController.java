package com.aitech.rbac.controller;

import com.aitech.rbac.model.Role;
import com.aitech.rbac.service.RoleService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleService service;
    public RoleController(RoleService service) { this.service = service; }

    @GetMapping public List<Role> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public Role getById(@PathVariable UUID id) { return service.getById(id); }
    @PostMapping public void create(@RequestBody Role entity) { service.create(entity); }
    @PutMapping("/{id}")
    public void update(@PathVariable UUID id, @RequestBody Role entity) {
        entity.setRoleId(id);
        service.update(entity);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { service.delete(id); }
}
