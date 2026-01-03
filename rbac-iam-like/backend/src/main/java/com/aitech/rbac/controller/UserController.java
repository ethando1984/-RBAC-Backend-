package com.aitech.rbac.controller;

import com.aitech.rbac.model.User;
import com.aitech.rbac.service.UserService;
import com.aitech.rbac.security.RequirePermission;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    @RequirePermission(namespace = "users", action = "read")
    public Object getAll(@RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search) {
        if (page == null && size == null) {
            return service.getAll();
        }
        return service.getAll(page != null ? page : 1, size != null ? size : 10, search);
    }

    @GetMapping("/{id}")
    @RequirePermission(namespace = "users", action = "read")
    public User getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping
    @RequirePermission(namespace = "users", action = "create")
    public void create(@RequestBody User entity) {
        service.create(entity);
    }

    @PutMapping("/{id}")
    @RequirePermission(namespace = "users", action = "update")
    public void update(@PathVariable UUID id, @RequestBody User entity) {
        entity.setUserId(id);
        service.update(entity);
    }

    @DeleteMapping("/{id}")
    @RequirePermission(namespace = "users", action = "delete")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
