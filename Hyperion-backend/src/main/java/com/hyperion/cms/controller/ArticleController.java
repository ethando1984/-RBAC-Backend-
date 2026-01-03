package com.hyperion.cms.controller;

import com.hyperion.cms.model.Tag;
import com.hyperion.cms.mapper.TagMapper;
import com.hyperion.cms.model.Article;
import com.hyperion.cms.mapper.ArticleMapper;
import com.hyperion.cms.security.PermissionService;
import com.hyperion.cms.security.RequirePermission;
import com.hyperion.cms.security.RequireCategoryPermission;
import com.hyperion.cms.model.ArticleVersion;
import com.hyperion.cms.mapper.ArticleVersionMapper;
import com.hyperion.cms.service.AuditService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleMapper articleMapper;
    private final ArticleVersionMapper versionMapper;
    private final TagMapper tagMapper;
    private final PermissionService permissionService;
    private final AuditService auditService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public ArticleController(ArticleMapper articleMapper, ArticleVersionMapper versionMapper, TagMapper tagMapper,
            PermissionService permissionService, AuditService auditService,
            com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.articleMapper = articleMapper;
        this.versionMapper = versionMapper;
        this.tagMapper = tagMapper;
        this.permissionService = permissionService;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    @RequirePermission(namespace = "articles", action = "read")
    public List<Article> list(@RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String authorUserId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<Article> articles = articleMapper.findAll(status, search, categoryId, authorUserId, startDate, endDate,
                size, page * size);
        // Populate cover media URLs
        articles.forEach(this::populateCoverMediaUrl);
        return articles;
    }

    private void populateCoverMediaUrl(Article article) {
        if (article.getCoverMediaId() != null) {
            // For file-based media system, construct URL from media ID
            // In a real system, you'd query the media_assets table
            try {
                java.nio.file.Path storageRoot = java.nio.file.Paths.get("uploads").toAbsolutePath();
                if (java.nio.file.Files.exists(storageRoot)) {
                    try (var stream = java.nio.file.Files.list(storageRoot)) {
                        stream.filter(java.nio.file.Files::isRegularFile)
                                .filter(path -> {
                                    String filename = path.getFileName().toString();
                                    UUID fileId = UUID.nameUUIDFromBytes(filename.getBytes());
                                    return fileId.equals(article.getCoverMediaId());
                                })
                                .findFirst()
                                .ifPresent(
                                        path -> article.setCoverMediaUrl("/uploads/" + path.getFileName().toString()));
                    }
                }
            } catch (Exception e) {
                // Silently fail - coverMediaUrl will remain null
            }
        }
    }

    @GetMapping("/{id}")
    @RequirePermission(namespace = "articles", action = "read")
    public Article get(@PathVariable UUID id) {
        Article article = articleMapper.findById(id);
        if (article != null) {
            article.setCategoryIds(articleMapper.findCategoryIdsByArticleId(id));
            article.setPrimaryCategoryId(articleMapper.findPrimaryCategoryIdByArticleId(id));
            List<Tag> tags = tagMapper.findTagsByArticleId(id);
            article.setTagIds(tags.stream().map(Tag::getId).toList());
            article.setTagNames(tags.stream().map(Tag::getName).toList());
        }
        return article;
    }

    @PostMapping
    @RequirePermission(namespace = "articles", action = "write")
    public Article create(@RequestBody Article article) {
        article.setId(UUID.randomUUID());
        article.setCreatedAt(LocalDateTime.now());
        article.setCreatedByUserId(permissionService.getCurrentUserId());
        article.setCreatedByEmail(permissionService.getCurrentUserEmail());
        article.setStatus(Article.ArticleStatus.DRAFT);
        article.setVisibility("PUBLIC");

        // Slug generation (very basic for MVP)
        if (article.getSlug() == null) {
            String titleBase = (article.getTitle() != null ? article.getTitle() : "untitled")
                    .toLowerCase().replaceAll("[^a-z0-9]", "-");
            article.setSlug(titleBase + "-" + UUID.randomUUID().toString().substring(0, 4));
        }

        articleMapper.insert(article);
        saveCategories(article);
        saveTags(article);
        return article;
    }

    @PutMapping("/{id}")
    @RequirePermission(namespace = "articles", action = "write")
    public Article update(@PathVariable UUID id, @RequestBody Article article) {
        Article existing = articleMapper.findById(id);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        Article old = cloneArticle(existing);
        // Detect content changes for workflow
        String oldTitle = existing.getTitle();
        boolean contentChanged = false;
        if (article.getContentHtml() != null && !article.getContentHtml().equals(existing.getContentHtml()))
            contentChanged = true;
        if (article.getTitle() != null && !article.getTitle().equals(oldTitle))
            contentChanged = true;

        // Update fields
        existing.setTitle(article.getTitle());
        existing.setSubtitle(article.getSubtitle());
        existing.setContentHtml(article.getContentHtml());
        existing.setExcerpt(article.getExcerpt());
        existing.setCoverMediaId(article.getCoverMediaId());
        existing.setSourceName(article.getSourceName());
        existing.setSourceUrl(article.getSourceUrl());
        existing.setSeoTitle(article.getSeoTitle());
        existing.setSeoDescription(article.getSeoDescription());
        existing.setCanonicalUrl(article.getCanonicalUrl());
        existing.setRobots(article.getRobots());
        existing.setVisibility(article.getVisibility());
        existing.setScheduledAt(article.getScheduledAt());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedByUserId(permissionService.getCurrentUserId());
        existing.setUpdatedByEmail(permissionService.getCurrentUserEmail());

        // Re-submit for review if content changed in a published article
        if (contentChanged && existing.getStatus() == Article.ArticleStatus.PUBLISHED) {
            existing.setStatus(Article.ArticleStatus.PENDING_EDITORIAL);
        }

        // Update slug if title changed significantly
        if (article.getTitle() != null && !article.getTitle().equals(oldTitle)) {
            existing.setSlug(article.getTitle().toLowerCase().replaceAll("[^a-z0-9]", "-") + "-"
                    + UUID.randomUUID().toString().substring(0, 4));
        }

        articleMapper.update(existing);

        // create version if changed
        if (contentChanged) {
            createVersion(existing, "Updated content");
            auditService.log("UPDATE", "ARTICLE", existing.getId().toString(), old, existing);
        }

        // Sync Categories
        existing.setCategoryIds(article.getCategoryIds());
        existing.setPrimaryCategoryId(article.getPrimaryCategoryId());
        saveCategories(existing);

        // Sync Tags
        existing.setTagNames(article.getTagNames());
        saveTags(existing);

        return existing;
    }

    private void saveCategories(Article article) {
        articleMapper.removeAllCategories(article.getId());
        if (article.getCategoryIds() != null) {
            for (UUID catId : article.getCategoryIds()) {
                boolean isPrimary = catId.equals(article.getPrimaryCategoryId());
                articleMapper.addCategory(article.getId(), catId, isPrimary);
            }
        }
    }

    private void saveTags(Article article) {
        tagMapper.removeAllTagsFromArticle(article.getId());
        if (article.getTagNames() != null) {
            for (String tagName : article.getTagNames()) {
                if (tagName == null || tagName.trim().isEmpty())
                    continue;
                tagName = tagName.trim();

                Tag tag = tagMapper.findByName(tagName);
                if (tag == null) {
                    tag = new Tag();
                    tag.setId(UUID.randomUUID());
                    tag.setName(tagName);
                    tag.setSlug(tagName.toLowerCase().replaceAll("[^a-z0-9]", "-"));
                    tag.setCreatedAt(LocalDateTime.now());
                    tagMapper.insert(tag);
                }
                tagMapper.addTagToArticle(article.getId(), tag.getId());
            }
        }
    }

    // Workflow Action: Submit for Publishing
    @PostMapping("/{id}/submit-publishing")
    @RequireCategoryPermission(namespace = "articles", action = "publish", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> submitPublishing(@PathVariable UUID id,
            @RequestParam(required = false) UUID categoryId) {
        Article article = getAndCheck(id);
        Article old = cloneArticle(article);
        article.setStatus(Article.ArticleStatus.PENDING_PUBLISHING);
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);
        createVersion(article, "Submitted for publishing");
        auditService.log("WORKFLOW_STATE_CHANGE", "ARTICLE", id.toString(), old, article);
        return ResponseEntity.ok().build();
    }

    // Workflow Action: Publish Now
    @PostMapping("/{id}/publish-now")
    @RequireCategoryPermission(namespace = "articles", action = "publish", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> publishNow(@PathVariable UUID id, @RequestParam(required = false) UUID categoryId) {
        Article article = getAndCheck(id);
        Article old = cloneArticle(article);
        article.setStatus(Article.ArticleStatus.PUBLISHED);
        article.setPublishedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);
        createVersion(article, "Published now");
        auditService.log("WORKFLOW_STATE_CHANGE", "ARTICLE", id.toString(), old, article);
        return ResponseEntity.ok().build();
    }

    // Workflow Action: Schedule Publish
    @PostMapping("/{id}/schedule")
    @RequireCategoryPermission(namespace = "articles", action = "publish", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> schedule(@PathVariable UUID id, @RequestParam LocalDateTime scheduledAt,
            @RequestParam(required = false) UUID categoryId) {
        Article article = getAndCheck(id);
        Article old = cloneArticle(article);
        article.setStatus(Article.ArticleStatus.SCHEDULED);
        article.setScheduledAt(scheduledAt);
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);
        createVersion(article, "Scheduled for " + scheduledAt);
        auditService.log("WORKFLOW_STATE_CHANGE", "ARTICLE", id.toString(), old, article);
        return ResponseEntity.ok().build();
    }

    // Workflow Action: Archive
    @PostMapping("/{id}/archive")
    @RequireCategoryPermission(namespace = "articles", action = "publish", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> archive(@PathVariable UUID id, @RequestParam(required = false) UUID categoryId) {
        Article article = getAndCheck(id);
        Article old = cloneArticle(article);
        article.setStatus(Article.ArticleStatus.ARCHIVED);
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);
        createVersion(article, "Archived");
        auditService.log("WORKFLOW_STATE_CHANGE", "ARTICLE", id.toString(), old, article);
        return ResponseEntity.ok().build();
    }

    // Workflow Action: Reject
    @PostMapping("/{id}/reject")
    @RequireCategoryPermission(namespace = "articles", action = "publish", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> reject(@PathVariable UUID id, @RequestParam String note,
            @RequestParam(required = false) UUID categoryId) {
        Article article = getAndCheck(id);
        Article old = cloneArticle(article);
        article.setStatus(Article.ArticleStatus.REJECTED);
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);
        createVersion(article, "Rejected: " + note);
        auditService.log("WORKFLOW_STATE_CHANGE", "ARTICLE", id.toString(), old, article);
        return ResponseEntity.ok().build();
    }

    // Versioning Endpoints
    @GetMapping("/{id}/versions")
    @RequirePermission(namespace = "articles", action = "read")
    public List<ArticleVersion> listVersions(@PathVariable UUID id) {
        return versionMapper.findByArticleId(id);
    }

    @GetMapping("/versions/{versionId}")
    @RequirePermission(namespace = "articles", action = "read")
    public ArticleVersion getVersion(@PathVariable UUID versionId) {
        return versionMapper.findById(versionId);
    }

    @PostMapping("/versions/{versionId}/restore")
    @RequirePermission(namespace = "articles", action = "write")
    public Article restoreVersion(@PathVariable UUID versionId) throws JsonProcessingException {
        ArticleVersion version = versionMapper.findById(versionId);
        if (version == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        Article restored = objectMapper.readValue(version.getSnapshotJson(), Article.class);
        Article existing = articleMapper.findById(restored.getId());
        if (existing == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        Article old = cloneArticle(existing);
        restored.setUpdatedAt(LocalDateTime.now());
        restored.setUpdatedByUserId(permissionService.getCurrentUserId());
        restored.setUpdatedByEmail(permissionService.getCurrentUserEmail());
        restored.setStatus(Article.ArticleStatus.DRAFT); // Always restore as draft

        articleMapper.update(restored);
        saveCategories(restored);
        saveTags(restored);

        createVersion(restored, "Restored from version " + version.getVersionNumber());
        auditService.log("VERSION_RESTORE", "ARTICLE", restored.getId().toString(), old, restored);
        return restored;
    }

    private Article getAndCheck(UUID id) {
        Article article = articleMapper.findById(id);
        if (article == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return article;
    }

    private void createVersion(Article article, String diffSummary) {
        try {
            ArticleVersion version = new ArticleVersion();
            version.setId(UUID.randomUUID());
            version.setArticleId(article.getId());
            version.setVersionNumber(versionMapper.getMaxVersionNumber(article.getId()) + 1);
            version.setSnapshotJson(objectMapper.writeValueAsString(article));
            version.setDiffSummary(diffSummary);
            version.setStatusAtThatTime(article.getStatus().name());
            version.setEditedByUserId(permissionService.getCurrentUserId());
            version.setEditedByEmail(permissionService.getCurrentUserEmail());
            version.setEditedAt(LocalDateTime.now());
            versionMapper.insert(version);
        } catch (Exception e) {
            log.error("Failed to create article version", e);
        }
    }

    private Article cloneArticle(Article a) {
        // Deep clone via JSON for audit
        try {
            return objectMapper.readValue(objectMapper.writeValueAsString(a), Article.class);
        } catch (Exception e) {
            return a;
        }
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ArticleController.class);
}
