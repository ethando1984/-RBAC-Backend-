package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.*;
import com.hyperion.cms.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/public")
@RequiredArgsConstructor
public class InternalPublicController {

    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final StorylineMapper storylineMapper;
    private final LayoutMapper layoutMapper;
    private final SlugRedirectMapper slugRedirectMapper;

    @GetMapping("/articles/{slug}")
    public Article getArticleBySlug(@PathVariable String slug) {
        Article article = articleMapper.findBySlug(slug);

        if (article == null || article.getStatus() != Article.ArticleStatus.PUBLISHED) {
            SlugRedirect redirect = slugRedirectMapper.findByOldSlug(slug, "ARTICLE");
            if (redirect != null) {
                Article redirectArticle = new Article();
                redirectArticle.setRedirectTo(redirect.getNewSlug());
                return redirectArticle;
            }
            return null;
        }

        // Populate associations
        article.setCategoryIds(articleMapper.findCategoryIdsByArticleId(article.getId()));
        List<Tag> tags = tagMapper.findTagsByArticleId(article.getId());
        article.setTagIds(tags.stream().map(Tag::getId).toList());
        article.setTagNames(tags.stream().map(Tag::getName).toList());
        populateCoverMediaUrl(article);
        return article;
    }

    private void populateCoverMediaUrl(Article article) {
        if (article.getCoverMediaId() != null) {
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
            }
        }
    }

    @GetMapping("/articles")
    public List<Article> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag) {

        UUID categoryId = null;
        if (category != null && !category.isEmpty()) {
            Category cat = categoryMapper.findBySlug(category);
            if (cat != null) {
                categoryId = cat.getId();
            } else {
                // Check for category redirect
                SlugRedirect redirect = slugRedirectMapper.findByOldSlug(category, "CATEGORY");
                if (redirect != null) {
                    Category realCat = categoryMapper.findBySlug(redirect.getNewSlug());
                    if (realCat != null)
                        categoryId = realCat.getId();
                }
            }
        }

        List<Article> articles = articleMapper.findAll("PUBLISHED", null, categoryId, null, null, null, pageSize,
                page * pageSize);
        articles.forEach(this::populateCoverMediaUrl);
        return articles;
    }

    @GetMapping("/categories/{slug}")
    public Category getCategoryBySlug(@PathVariable String slug) {
        Category category = categoryMapper.findBySlug(slug);
        if (category == null) {
            SlugRedirect redirect = slugRedirectMapper.findByOldSlug(slug, "CATEGORY");
            if (redirect != null) {
                Category redirectCat = new Category();
                redirectCat.setRedirectTo(redirect.getNewSlug());
                return redirectCat;
            }
        }
        return category;
    }

    @GetMapping("/tags/{slug}")
    public Tag getTagBySlug(@PathVariable String slug) {
        Tag tag = tagMapper.findBySlug(slug);
        if (tag == null) {
            tag = tagMapper.findByName(slug); // Legacy fallback
        }
        if (tag == null) {
            SlugRedirect redirect = slugRedirectMapper.findByOldSlug(slug, "TAG");
            if (redirect != null) {
                Tag redirectTag = new Tag();
                redirectTag.setRedirectTo(redirect.getNewSlug());
                return redirectTag;
            }
        }
        return tag;
    }

    @GetMapping("/storylines/{slug}")
    public Storyline getStorylineBySlug(@PathVariable String slug) {
        Storyline storyline = storylineMapper.findBySlug(slug);
        if (storyline == null) {
            SlugRedirect redirect = slugRedirectMapper.findByOldSlug(slug, "STORYLINE");
            if (redirect != null) {
                Storyline redirectSl = new Storyline();
                redirectSl.setRedirectTo(redirect.getNewSlug());
                return redirectSl;
            }
            return null;
        }

        List<UUID> articleIds = storylineMapper.findArticleIdsByStorylineId(storyline.getId());
        if (articleIds != null && !articleIds.isEmpty()) {
            List<Article> articles = articleIds.stream()
                    .map(articleMapper::findById)
                    .filter(a -> a != null && Article.ArticleStatus.PUBLISHED.equals(a.getStatus()))
                    .peek(a -> {
                        populateCoverMediaUrl(a);
                        a.setCategoryIds(articleMapper.findCategoryIdsByArticleId(a.getId()));
                        List<Tag> tags = tagMapper.findTagsByArticleId(a.getId());
                        a.setTagIds(tags.stream().map(Tag::getId).toList());
                        a.setTagNames(tags.stream().map(Tag::getName).toList());
                    })
                    .toList();
            storyline.setArticles(articles);
        }

        return storyline;
    }

    @GetMapping("/layouts/homepage")
    public Layout getHomepageLayout() {
        return layoutMapper.findHomepage();
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryMapper.findAll();
    }

    @GetMapping("/storylines")
    public List<Storyline> getStorylines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return storylineMapper.findAll("ONGOING", null, pageSize, page * pageSize);
    }
}
