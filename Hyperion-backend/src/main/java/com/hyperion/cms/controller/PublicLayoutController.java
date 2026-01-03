package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.LayoutMapper;
import com.hyperion.cms.model.Layout;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/layouts")
public class PublicLayoutController {

    private final LayoutMapper layoutMapper;

    public PublicLayoutController(LayoutMapper layoutMapper) {
        this.layoutMapper = layoutMapper;
    }

    @GetMapping("/standalone/{slug}")
    public Layout getStandalone(@PathVariable String slug) {
        Layout layout = layoutMapper.findBySlug(slug);
        if (layout == null || !layout.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return layout;
    }

    @GetMapping("/homepage")
    public Layout getHomepage() {
        Layout layout = layoutMapper.findHomepage();
        if (layout == null) {
            // Return empty default or 404
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No active homepage layout");
        }
        return layout;
    }

    @GetMapping("/resolve")
    public Layout resolve(
            @RequestParam String type,
            @RequestParam(required = false) String targetId) {

        try {
            Layout.LayoutType layoutType = Layout.LayoutType.valueOf(type.toUpperCase());
            // If targetId is provided, try to find specific override, else fallback to
            // default
            Layout layout = layoutMapper.findForTarget(layoutType.name(), targetId);

            // If we found a specific one but it's inactive, should we fallback to default?
            // The query `findForTarget` is simple. Let's assume we want the *best match*.
            // Improving logic:
            // 1. Precise match (targetId + type)
            // 2. Default match (type + isDefault)

            // Current SQL: SELECT * FROM layouts WHERE type = ? AND (target_id = ? OR
            // is_default = true) ORDER BY is_default ASC LIMIT 1
            // `is_default ASC` means `false` comes before `true`.
            // So if we have a specific target (is_default=false) it comes first. Correct.

            if (layout == null || !layout.isActive()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            }
            return layout;

        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid layout type");
        }
    }

    @GetMapping("/{id}")
    public Layout getById(@PathVariable UUID id) {
        Layout layout = layoutMapper.findById(id);
        if (layout == null || !layout.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return layout;
    }
}
