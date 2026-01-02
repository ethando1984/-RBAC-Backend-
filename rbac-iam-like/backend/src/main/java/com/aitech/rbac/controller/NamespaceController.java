package com.aitech.rbac.controller;

import com.aitech.rbac.dto.NamespaceDTO;
import com.aitech.rbac.model.Namespace;
import com.aitech.rbac.service.NamespaceService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/namespaces")
public class NamespaceController {
    private final NamespaceService service;

    public NamespaceController(NamespaceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Namespace> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Namespace getById(@PathVariable("id") UUID id) {
        return service.getById(id);
    }

    @PostMapping
    public void create(@RequestBody NamespaceDTO dto) {
        Namespace entity = new Namespace();
        entity.setNamespaceId(UUID.randomUUID());
        entity.setNamespaceKey(dto.getNamespaceKey());
        entity.setDescription(dto.getDescription());
        service.create(entity);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable("id") UUID id, @RequestBody NamespaceDTO dto) {
        Namespace entity = new Namespace();
        entity.setNamespaceId(id);
        entity.setNamespaceKey(dto.getNamespaceKey());
        entity.setDescription(dto.getDescription());
        service.update(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") UUID id) {
        service.delete(id);
    }
}
