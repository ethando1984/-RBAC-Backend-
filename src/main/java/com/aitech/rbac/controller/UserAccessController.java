package com.aitech.rbac.controller;

import com.aitech.rbac.dto.UserAccessDTO;
import com.aitech.rbac.service.UserAccessService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/access")
public class UserAccessController {
    private final UserAccessService service;

    public UserAccessController(UserAccessService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public List<UserAccessDTO> getUserAccess(@PathVariable UUID userId) {
        return service.getUserAccess(userId);
    }
}
