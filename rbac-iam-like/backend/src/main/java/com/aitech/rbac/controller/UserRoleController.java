package com.aitech.rbac.controller;

import com.aitech.rbac.model.UserRole;
import com.aitech.rbac.service.UserRoleService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-roles")
public class UserRoleController {
    private final UserRoleService service;

    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @PostMapping
    public void create(@RequestBody UserRole entity) {
        service.create(entity);
    }

    @DeleteMapping
    public void delete(@RequestBody UserRole entity) {
        service.delete(entity);
    }
}
