package com.aitech.rbac.controller;

import com.aitech.rbac.model.Namespace;
import com.aitech.rbac.service.NamespaceService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/namespaces")
public class NamespaceController {
    private final NamespaceService service;
    public NamespaceController(NamespaceService service) { this.service = service; }

    @GetMapping public List<Namespace> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public Namespace getById(@PathVariable UUID id) { return service.getById(id); }
    @PostMapping public void create(@RequestBody Namespace entity) { service.create(entity); }
    @PutMapping("/{id}") public void update(@PathVariable UUID id, @RequestBody Namespace entity) { service.update(entity); }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { service.delete(id); }
}
