package com.aitech.rbac.controller;

import com.aitech.rbac.model.Role;
import com.aitech.rbac.service.RoleService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
public class UserGraphQLController {
    private final RoleService roleService;
    public UserGraphQLController(RoleService roleService) { this.roleService = roleService; }

    @QueryMapping
    public List<Role> userRoles(@Argument UUID userId) {
        return roleService.getByUserId(userId);
    }
}
