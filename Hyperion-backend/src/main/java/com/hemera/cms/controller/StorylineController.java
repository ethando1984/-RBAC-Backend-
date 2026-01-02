package com.hemera.cms.controller;

import com.hemera.cms.model.Storyline;
import com.hemera.cms.mapper.StorylineMapper;
import com.hemera.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/storylines")
public class StorylineController {

    private final StorylineMapper storylineMapper;
    private final PermissionService permissionService;

    public StorylineController(StorylineMapper storylineMapper, PermissionService permissionService) {
        this.storylineMapper = storylineMapper;
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<Storyline> list(@RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "10") int limit, @RequestParam(defaultValue = "0") int offset) {
        if (!permissionService.can("storylines", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:read permission");
        }
        return storylineMapper.findAll(search, limit, offset);
    }

    @GetMapping("/{id}")
    public Storyline get(@PathVariable UUID id) {
        // Permission check inside readStoryline
        return readStoryline(id);
    }

    @PostMapping
    public Storyline create(@RequestBody Storyline storyline) {
        if (!permissionService.can("storylines", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:write permission");
        }

        storyline.setId(UUID.randomUUID());
        storyline.setCreatedAt(LocalDateTime.now());
        storyline.setUpdatedAt(LocalDateTime.now());
        storyline.setCreatedByUserId(permissionService.getCurrentUserId());
        storyline.setCreatedByEmail(permissionService.getCurrentUserEmail());

        if (storyline.getStatus() == null) {
            storyline.setStatus("ONGOING");
        }
        if (storyline.getSlug() == null || storyline.getSlug().isEmpty()) {
            storyline.setSlug(storyline.getTitle().toLowerCase().replaceAll("[^a-z0-9]", "-") + "-"
                    + UUID.randomUUID().toString().substring(0, 4));
        }

        storylineMapper.insert(storyline);
        saveArticles(storyline);
        return storyline;
    }

    @PutMapping("/{id}")
    public Storyline update(@PathVariable UUID id, @RequestBody Storyline storyline) {
        if (!permissionService.can("storylines", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:write permission");
        }

        Storyline existing = storylineMapper.findById(id);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        existing.setTitle(storyline.getTitle());
        existing.setDescription(storyline.getDescription());
        existing.setStatus(storyline.getStatus());
        existing.setSeoTitle(storyline.getSeoTitle());
        existing.setSeoDescription(storyline.getSeoDescription());
        existing.setContentsJson(storyline.getContentsJson());
        existing.setLayoutJson(storyline.getLayoutJson());
        existing.setUpdatedAt(LocalDateTime.now());

        if (storyline.getSlug() != null && !storyline.getSlug().isEmpty()) {
            existing.setSlug(storyline.getSlug());
        }

        storylineMapper.update(existing);

        if (storyline.getArticleIds() != null) {
            existing.setArticleIds(storyline.getArticleIds());
            saveArticles(existing);
        }

        return existing;
    }

    @PutMapping("/{id}/contents")
    public void updateContents(@PathVariable UUID id, @RequestBody String contentsJson) {
        if (!permissionService.can("storylines", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:write permission");
        }
        Storyline existing = storylineMapper.findById(id);
        if (existing == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        storylineMapper.updateContents(id, contentsJson, LocalDateTime.now());
    }

    @PutMapping("/{id}/layout")
    public void updateLayout(@PathVariable UUID id, @RequestBody String layoutJson) {
        if (!permissionService.can("storylines", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:write permission");
        }
        Storyline existing = storylineMapper.findById(id);
        if (existing == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        storylineMapper.updateLayout(id, layoutJson, LocalDateTime.now());
    }

    @PostMapping("/{id}/media")
    public void addMedia(@PathVariable UUID id, @RequestBody MediaAttachRequest request) {
        if (!permissionService.can("storylines", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:write permission");
        }
        // Simplified: just append for now
        for (UUID mediaId : request.mediaIds) {
            storylineMapper.addMedia(id, mediaId, request.role != null ? request.role : "GALLERY", 0);
        }
    }

    @DeleteMapping("/{id}/media/{mediaId}")
    public void removeMedia(@PathVariable UUID id, @PathVariable UUID mediaId) {
        if (!permissionService.can("storylines", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:write permission");
        }
        storylineMapper.removeMedia(id, mediaId);
    }

    @GetMapping("/{id}/preview")
    public Storyline preview(@PathVariable UUID id) {
        return readStoryline(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        if (!permissionService.can("storylines", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:write permission");
        }
        storylineMapper.removeAllArticles(id);
        storylineMapper.removeAllMedia(id);
        storylineMapper.delete(id);
    }

    private Storyline readStoryline(UUID id) {
        if (!permissionService.can("storylines", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:read permission");
        }
        Storyline storyline = storylineMapper.findById(id);
        if (storyline == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        storyline.setArticleIds(storylineMapper.findArticleIdsByStorylineId(id));
        storyline.setMedia(storylineMapper.findMediaByStorylineId(id));
        return storyline;
    }

    private void saveArticles(Storyline storyline) {
        storylineMapper.removeAllArticles(storyline.getId());
        if (storyline.getArticleIds() != null) {
            for (int i = 0; i < storyline.getArticleIds().size(); i++) {
                storylineMapper.addArticle(storyline.getArticleIds().get(i), storyline.getId(), i);
            }
        }
    }

    public static class MediaAttachRequest {
        public List<UUID> mediaIds;
        public String role;
        // sortOrderMode ignored for MVP
    }
}
