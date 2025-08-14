package com.aitech.rbac.controller;

import com.aitech.rbac.model.UserRole;
import com.aitech.rbac.service.UserRoleService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/user_roles")
public class UserRoleController {
    private final UserRoleService service;
    public UserRoleController(UserRoleService service) { this.service = service; }

    @GetMapping public List<UserRole> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public UserRole getById(@PathVariable UUID id) { return service.getById(id); }
    @PostMapping public void create(@RequestBody UserRole entity) { service.create(entity); }
    @PutMapping("/{id}") public void update(@PathVariable UUID id, @RequestBody UserRole entity) { service.update(entity); }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { service.delete(id); }
}
