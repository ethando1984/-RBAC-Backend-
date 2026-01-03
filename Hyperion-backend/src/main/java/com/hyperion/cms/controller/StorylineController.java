package com.hyperion.cms.controller;

import com.hyperion.cms.model.Storyline;
import com.hyperion.cms.mapper.StorylineMapper;
import com.hyperion.cms.security.PermissionService;
import com.hyperion.cms.service.SlugService;
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
    private final SlugService slugService;

    public StorylineController(StorylineMapper storylineMapper, PermissionService permissionService,
            SlugService slugService) {
        this.storylineMapper = storylineMapper;
        this.permissionService = permissionService;
        this.slugService = slugService;
    }

    @GetMapping
    public com.hyperion.cms.dto.PagedResponse<Storyline> list(@RequestParam(required = false) String status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "10") int limit, @RequestParam(defaultValue = "0") int offset) {
        if (!permissionService.can("storylines", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing storylines:read permission");
        }
        List<Storyline> items = storylineMapper.findAll(status, search, limit, offset);
        long total = storylineMapper.countAll(status, search);

        return com.hyperion.cms.dto.PagedResponse.<Storyline>builder()
                .items(items)
                .total(total)
                .page(offset / limit + 1)
                .size(limit)
                .build();
    }

    @GetMapping("/{id}")
    public Storyline get(@PathVariable UUID id) {
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

        // Slug generation
        if (storyline.getSlug() == null || storyline.getSlug().trim().isEmpty()) {
            String slugBase = slugService.toAsciiSlug(storyline.getTitle());
            storyline.setSlug(slugService.ensureUniqueSlug("STORYLINE", slugBase, storyline.getId()));
        } else {
            storyline.setSlug(slugService.toAsciiSlug(storyline.getSlug()));
            storyline.setSlug(slugService.ensureUniqueSlug("STORYLINE", storyline.getSlug(), storyline.getId()));
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

        String oldSlug = existing.getSlug();
        String oldTitle = existing.getTitle();

        existing.setTitle(storyline.getTitle());
        existing.setDescription(storyline.getDescription());
        existing.setStatus(storyline.getStatus());
        existing.setSeoTitle(storyline.getSeoTitle());
        existing.setSeoDescription(storyline.getSeoDescription());
        existing.setContentsJson(storyline.getContentsJson());
        existing.setLayoutJson(storyline.getLayoutJson());
        existing.setUpdatedAt(LocalDateTime.now());

        // Slug handling
        if (storyline.getSlug() != null && !storyline.getSlug().trim().isEmpty()) {
            existing.setSlug(slugService.toAsciiSlug(storyline.getSlug()));
            existing.setSlug(slugService.ensureUniqueSlug("STORYLINE", existing.getSlug(), id));
        } else if (storyline.getTitle() != null && !storyline.getTitle().equals(oldTitle)) {
            String slugBase = slugService.toAsciiSlug(storyline.getTitle());
            existing.setSlug(slugService.ensureUniqueSlug("STORYLINE", slugBase, id));
        }

        if (!existing.getSlug().equals(oldSlug)) {
            slugService.handleSlugChange("STORYLINE", id, oldSlug, existing.getSlug());
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
    }
}
