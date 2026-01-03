package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.LayoutMapper;
import com.hyperion.cms.model.Layout;
import com.hyperion.cms.security.PermissionService;
import com.hyperion.cms.security.RequirePermission;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/layouts")
public class LayoutController {

    private final LayoutMapper layoutMapper;
    private final PermissionService permissionService;

    public LayoutController(LayoutMapper layoutMapper, PermissionService permissionService) {
        this.layoutMapper = layoutMapper;
        this.permissionService = permissionService;
    }

    // --- Admin Endpoints ---

    @GetMapping
    @RequirePermission(namespace = "layouts", action = "read")
    public List<Layout> list() {
        return layoutMapper.findAll();
    }

    @GetMapping("/{id}")
    @RequirePermission(namespace = "layouts", action = "read")
    public Layout get(@PathVariable UUID id) {
        Layout layout = layoutMapper.findById(id);
        if (layout == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return layout;
    }

    @PostMapping
    @RequirePermission(namespace = "layouts", action = "manage")
    public Layout create(@RequestBody Layout layout) {
        layout.setId(UUID.randomUUID());
        layout.setCreatedAt(LocalDateTime.now());
        layout.setUpdatedAt(LocalDateTime.now());
        layout.setCreatedByUserId(permissionService.getCurrentUserId());

        // Basic validation
        if (layout.getType() == Layout.LayoutType.STANDALONE
                && (layout.getSlug() == null || layout.getSlug().isEmpty())) {
            layout.setSlug(layout.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }

        layoutMapper.insert(layout);
        return layout;
    }

    @PutMapping("/{id}")
    @RequirePermission(namespace = "layouts", action = "manage")
    public Layout update(@PathVariable UUID id, @RequestBody Layout layout) {
        Layout existing = layoutMapper.findById(id);
        if (existing == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        layout.setId(id);
        layout.setUpdatedAt(LocalDateTime.now());
        layout.setUpdatedByUserId(permissionService.getCurrentUserId());
        // Preserve creation info
        layout.setCreatedAt(existing.getCreatedAt());
        layout.setCreatedByUserId(existing.getCreatedByUserId());

        layoutMapper.update(layout);
        return layout;
    }

    @DeleteMapping("/{id}")
    @RequirePermission(namespace = "layouts", action = "manage")
    public void delete(@PathVariable UUID id) {
        layoutMapper.delete(id);
    }
}
