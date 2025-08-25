package com.aitech.rbac.controller;

import com.aitech.rbac.model.ResourceAccess;
import com.aitech.rbac.service.ResourceAccessService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resource_access")
public class ResourceAccessController {
    private final ResourceAccessService service;

    public ResourceAccessController(ResourceAccessService service) {
        this.service = service;
    }

    @PostMapping
    public void create(@RequestBody ResourceAccess entity) {
        service.create(entity);
    }

    @DeleteMapping
    public void delete(@RequestBody ResourceAccess entity) {
        service.delete(entity);
    }
}
