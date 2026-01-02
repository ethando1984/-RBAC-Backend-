package com.hemera.cms.controller;

import com.hemera.cms.mapper.TagMapper;
import com.hemera.cms.model.Tag;
import com.hemera.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagMapper tagMapper;
    private final PermissionService permissionService;

    public TagController(TagMapper tagMapper, PermissionService permissionService) {
        this.tagMapper = tagMapper;
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<Tag> list() {
        if (!permissionService.can("articles", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing articles:read permission");
        }
        return tagMapper.findAll();
    }

    @GetMapping("/{id}")
    public Tag get(@PathVariable UUID id) {
        if (!permissionService.can("articles", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing articles:read permission");
        }
        Tag tag = tagMapper.findById(id);
        if (tag == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return tag;
    }

    @PostMapping
    public Tag create(@RequestBody Tag tag) {
        if (!permissionService.can("articles", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing articles:write permission");
        }
        if (tag.getId() == null)
            tag.setId(UUID.randomUUID());
        if (tag.getCreatedAt() == null)
            tag.setCreatedAt(LocalDateTime.now());

        // Simple slug generation if not provided
        if (tag.getSlug() == null || tag.getSlug().isEmpty()) {
            tag.setSlug(tag.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }

        // Check for duplicate name
        if (tagMapper.findByName(tag.getName()) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tag already exists with name: " + tag.getName());
        }

        tagMapper.insert(tag);
        return tag;
    }

    @PutMapping("/{id}")
    public Tag update(@PathVariable UUID id, @RequestBody Tag tag) {
        if (!permissionService.can("articles", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing articles:write permission");
        }
        tag.setId(id);
        tagMapper.update(tag);
        return tag;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        if (!permissionService.can("articles", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing articles:write permission");
        }
        tagMapper.delete(id);
    }

    @GetMapping("/article/{articleId}")
    public List<Tag> getArticleTags(@PathVariable UUID articleId) {
        return tagMapper.findTagsByArticleId(articleId);
    }

    @GetMapping("/search")
    public List<Tag> search(@RequestParam String q) {
        if (!permissionService.can("articles", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing articles:read permission");
        }
        return tagMapper.findAll().stream()
                .filter(t -> t.getName().toLowerCase().contains(q.toLowerCase()))
                .limit(10)
                .toList();
    }

    @GetMapping("/trending")
    public List<Tag> trending() {
        // Mock trending - for now just returns first 5
        return tagMapper.findAll().stream().limit(5).toList();
    }
}
