package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.ArticleMapper;
import com.hyperion.cms.model.Article;
import com.hyperion.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seo")
public class SEOController {

    private final ArticleMapper articleMapper;
    private final PermissionService permissionService;

    public SEOController(ArticleMapper articleMapper, PermissionService permissionService) {
        this.articleMapper = articleMapper;
        this.permissionService = permissionService;
    }

    @GetMapping("/sitemap")
    public Map<String, Object> getSitemapInfo() {
        if (!permissionService.can("seo", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing seo:read permission");
        }
        List<Article> publishedArticles = articleMapper.findAll("PUBLISHED", null, 1000, 0);

        return Map.of(
                "totalUrls", publishedArticles.size(),
                "lastGenerated", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
                "sitemapUrl", "/sitemap.xml");
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String generateSitemap() {
        // Sitemap is public - no permission check needed
        List<Article> publishedArticles = articleMapper.findAll("PUBLISHED", null, 1000, 0);

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Homepage
        xml.append("  <url>\n");
        xml.append("    <loc>https://hemera.com/</loc>\n");
        xml.append("    <changefreq>daily</changefreq>\n");
        xml.append("    <priority>1.0</priority>\n");
        xml.append("  </url>\n");

        // Articles
        for (Article article : publishedArticles) {
            xml.append("  <url>\n");
            xml.append("    <loc>https://hemera.com/articles/").append(article.getSlug()).append("</loc>\n");
            if (article.getUpdatedAt() != null) {
                xml.append("    <lastmod>").append(article.getUpdatedAt().format(DateTimeFormatter.ISO_DATE))
                        .append("</lastmod>\n");
            }
            xml.append("    <changefreq>weekly</changefreq>\n");
            xml.append("    <priority>0.8</priority>\n");
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        if (!permissionService.can("seo", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing seo:read permission");
        }
        List<Article> allArticles = articleMapper.findAll(null, null, 10000, 0);

        int missingMetaDesc = 0;
        int missingSeoTitle = 0;
        int missingAltTags = 0;

        for (Article article : allArticles) {
            if (article.getSeoDescription() == null || article.getSeoDescription().isEmpty()) {
                missingMetaDesc++;
            }
            if (article.getSeoTitle() == null || article.getSeoTitle().isEmpty()) {
                missingSeoTitle++;
            }
            // Simplified alt tag check
            if (article.getCoverMediaId() == null) {
                missingAltTags++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalArticles", allArticles.size());
        result.put("missingMetaDescription", missingMetaDesc);
        result.put("missingSeoTitle", missingSeoTitle);
        result.put("missingAltTags", missingAltTags);
        result.put("healthScore",
                calculateHealthScore(allArticles.size(), missingMetaDesc, missingSeoTitle, missingAltTags));

        return result;
    }

    @GetMapping("/robots.txt")
    public String getRobotsTxt() {
        // Robots.txt is public - no permission check needed
        return "User-agent: *\n" +
                "Allow: /\n" +
                "Disallow: /admin/\n" +
                "Disallow: /api/\n" +
                "\n" +
                "Sitemap: https://hemera.com/sitemap.xml";
    }

    private int calculateHealthScore(int total, int missingDesc, int missingTitle, int missingAlt) {
        if (total == 0)
            return 100;
        int issues = missingDesc + missingTitle + missingAlt;
        int maxIssues = total * 3; // 3 potential issues per article
        return Math.max(0, 100 - (issues * 100 / maxIssues));
    }
}
