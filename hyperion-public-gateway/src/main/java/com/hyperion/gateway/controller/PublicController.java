package com.hyperion.gateway.controller;

import com.hyperion.gateway.model.*;
import com.hyperion.gateway.service.PublicApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // In production, limit to frontend URL
public class PublicController {

    private final PublicApiService publicApiService;

    @GetMapping("/home")
    public ResponseEntity<HomeResponse> getHome() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.MINUTES))
                .body(publicApiService.getHomeData());
    }

    @GetMapping("/articles/{slug}")
    public ResponseEntity<?> getArticle(@PathVariable String slug) {
        ArticleDto article = publicApiService.getArticle(slug);
        if (article != null && article.getRedirectTo() != null) {
            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                    .header(HttpHeaders.LOCATION, "/public/articles/" + article.getRedirectTo())
                    .build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.MINUTES).mustRevalidate())
                .body(article);
    }

    @GetMapping("/categories/{slug}")
    public ResponseEntity<?> getCategory(@PathVariable String slug) {
        CategoryDto category = publicApiService.getCategory(slug);
        if (category != null && category.getRedirectTo() != null) {
            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                    .header(HttpHeaders.LOCATION, "/public/categories/" + category.getRedirectTo())
                    .build();
        }
        return ResponseEntity.ok(category);
    }

    @GetMapping("/categories/{slug}/articles")
    public ResponseEntity<List<ArticleDto>> getCategoryArticles(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(publicApiService.getArticles(page, pageSize, slug, null));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(publicApiService.getCategoriesList());
    }

    @GetMapping("/tags/{slug}")
    public ResponseEntity<?> getTag(@PathVariable String slug) {
        TagDto tag = publicApiService.getTag(slug);
        if (tag != null && tag.getRedirectTo() != null) {
            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                    .header(HttpHeaders.LOCATION, "/public/tags/" + tag.getRedirectTo())
                    .build();
        }
        return ResponseEntity.ok(tag);
    }

    @GetMapping("/tags/{slug}/articles")
    public ResponseEntity<List<ArticleDto>> getTagArticles(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(publicApiService.getArticles(page, pageSize, null, slug));
    }

    @GetMapping("/tags")
    public ResponseEntity<List<TagDto>> getTags() {
        return ResponseEntity.ok(publicApiService.getTagsList());
    }

    @GetMapping("/storylines/{slug}")
    public ResponseEntity<?> getStoryline(@PathVariable String slug) {
        StorylineDto storyline = publicApiService.getStoryline(slug);
        if (storyline != null && storyline.getRedirectTo() != null) {
            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                    .header(HttpHeaders.LOCATION, "/public/storylines/" + storyline.getRedirectTo())
                    .build();
        }
        return ResponseEntity.ok(storyline);
    }

    @GetMapping("/articles")
    public ResponseEntity<List<ArticleDto>> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(publicApiService.getArticles(page, pageSize, null, null));
    }

    @GetMapping("/storylines")
    public ResponseEntity<List<StorylineDto>> getStorylines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(publicApiService.getStorylinesList(page, pageSize));
    }

    @GetMapping("/layouts/standalone/{slug}")
    public ResponseEntity<?> getStandaloneLayout(@PathVariable String slug) {
        return ResponseEntity.ok(publicApiService.getStandaloneLayout(slug));
    }

    @GetMapping("/layouts/resolve")
    public ResponseEntity<?> resolveLayout(
            @RequestParam String type,
            @RequestParam(required = false) String targetId) {
        return ResponseEntity.ok(publicApiService.resolveLayout(type, targetId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ArticleDto>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(publicApiService.searchArticles(q, page, pageSize));
    }

    @GetMapping("/robots.txt")
    public ResponseEntity<String> getRobots() {
        return ResponseEntity.ok("User-agent: *\nAllow: /\nSitemap: http://localhost:8082/public/sitemap.xml");
    }

    @GetMapping("/sitemap.xml")
    public ResponseEntity<String> getSitemap() {
        // Simple mock for now, can be delegated to service
        return ResponseEntity.ok()
                .header("Content-Type", "application/xml")
                .body("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>");
    }
}
