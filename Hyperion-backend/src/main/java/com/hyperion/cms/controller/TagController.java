package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.TagMapper;
import com.hyperion.cms.model.Tag;
import com.hyperion.cms.security.PermissionService;
import com.hyperion.cms.service.SlugService;
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
    private final SlugService slugService;

    public TagController(TagMapper tagMapper, PermissionService permissionService, SlugService slugService) {
        this.tagMapper = tagMapper;
        this.permissionService = permissionService;
        this.slugService = slugService;
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

        // Slug generation
        if (tag.getSlug() == null || tag.getSlug().trim().isEmpty()) {
            String slugBase = slugService.toAsciiSlug(tag.getName());
            tag.setSlug(slugService.ensureUniqueSlug("TAG", slugBase, tag.getId()));
        } else {
            tag.setSlug(slugService.toAsciiSlug(tag.getSlug()));
            tag.setSlug(slugService.ensureUniqueSlug("TAG", tag.getSlug(), tag.getId()));
        }

        // Check for duplicate name (strict on name too)
        Tag existing = tagMapper.findByName(tag.getName());
        if (existing != null && !existing.getId().equals(tag.getId())) {
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

        Tag existing = tagMapper.findById(id);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        String oldSlug = existing.getSlug();
        tag.setId(id);

        if (tag.getSlug() == null || tag.getSlug().trim().isEmpty()) {
            if (!tag.getName().equals(existing.getName())) {
                String slugBase = slugService.toAsciiSlug(tag.getName());
                tag.setSlug(slugService.ensureUniqueSlug("TAG", slugBase, id));
            } else {
                tag.setSlug(oldSlug);
            }
        } else {
            tag.setSlug(slugService.toAsciiSlug(tag.getSlug()));
            tag.setSlug(slugService.ensureUniqueSlug("TAG", tag.getSlug(), id));
        }

        if (!tag.getSlug().equals(oldSlug)) {
            slugService.handleSlugChange("TAG", id, oldSlug, tag.getSlug());
        }

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
        return tagMapper.findAll().stream().limit(5).toList();
    }
}
