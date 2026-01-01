package com.aitech.rbac.controller;

import com.aitech.rbac.model.Registry;
import com.aitech.rbac.service.RegistryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/registry")
public class RegistryController {

    private final RegistryService registryService;

    public RegistryController(RegistryService registryService) {
        this.registryService = registryService;
    }

    @GetMapping
    public Registry getRegistry() {
        return registryService.getRegistry();
    }
}
