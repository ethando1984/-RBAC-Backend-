package com.hyperion.cms.controller;

import com.hyperion.cms.model.Tag;
import com.hyperion.cms.mapper.TagMapper;
import com.hyperion.cms.model.Article;
import com.hyperion.cms.mapper.ArticleMapper;
import com.hyperion.cms.security.PermissionService;
import com.hyperion.cms.security.RequirePermission;
import com.hyperion.cms.security.RequireCategoryPermission;
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
    private final TagMapper tagMapper;
    private final PermissionService permissionService;

    public ArticleController(ArticleMapper articleMapper, TagMapper tagMapper,
            PermissionService permissionService) {
        this.articleMapper = articleMapper;
        this.tagMapper = tagMapper;
        this.permissionService = permissionService;
    }

    @GetMapping
    @RequirePermission(namespace = "articles", action = "read")
    public List<Article> list(@RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return articleMapper.findAll(status, search, size, page * size);
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

    // Workflow Action: Submit for Editorial
    @PostMapping("/{id}/submit-editorial")
    @RequireCategoryPermission(namespace = "articles", action = "write", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> submitEditorial(@PathVariable UUID id,
            @RequestParam(required = false) UUID categoryId) {

        Article article = articleMapper.findById(id);
        if (article == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        article.setStatus(Article.ArticleStatus.PENDING_EDITORIAL);
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);

        return ResponseEntity.ok().build();
    }

    // Workflow Action: Publish
    @PostMapping("/{id}/publish")
    @RequireCategoryPermission(namespace = "articles", action = "publish", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> publish(@PathVariable UUID id, @RequestParam(required = false) UUID categoryId) {

        Article article = articleMapper.findById(id);
        if (article == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        article.setStatus(Article.ArticleStatus.PUBLISHED);
        article.setPublishedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);

        return ResponseEntity.ok().build();
    }

    // Workflow Action: Reject
    @PostMapping("/{id}/reject")
    @RequireCategoryPermission(namespace = "articles", action = "publish", categoryIdParam = "#categoryId")
    public ResponseEntity<Void> reject(@PathVariable UUID id, @RequestParam(required = false) UUID categoryId) {

        Article article = articleMapper.findById(id);
        if (article == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        article.setStatus(Article.ArticleStatus.DRAFT);
        article.setUpdatedAt(LocalDateTime.now());
        articleMapper.update(article);

        return ResponseEntity.ok().build();
    }
}
