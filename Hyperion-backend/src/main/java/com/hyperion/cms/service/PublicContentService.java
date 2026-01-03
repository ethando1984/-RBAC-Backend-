package com.hyperion.cms.service;

import com.hyperion.cms.dto.PublicArticleDTO;
import com.hyperion.cms.mapper.ArticleMapper;
import com.hyperion.cms.mapper.TagMapper;
import com.hyperion.cms.model.Article;
import com.hyperion.cms.model.Tag;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PublicContentService {

    private final ArticleMapper articleMapper;
    private final TagMapper tagMapper;

    public PublicContentService(ArticleMapper articleMapper, TagMapper tagMapper) {
        this.articleMapper = articleMapper;
        this.tagMapper = tagMapper;
    }

    /**
     * Get featured articles for homepage "Featured" tab
     */
    public List<PublicArticleDTO> getFeaturedArticles(int limit) {
        List<Article> articles = articleMapper.findAll("PUBLISHED", null, null, null, null, null, limit, 0);
        return articles.stream()
                .map(this::convertToPublicDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get latest published articles for "Latest" tab
     */
    public List<PublicArticleDTO> getLatestArticles(int page, int size) {
        List<Article> articles = articleMapper.findAll("PUBLISHED", null, null, null, null, null, size, page * size);
        return articles.stream()
                .map(this::convertToPublicDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get articles by category
     */
    public List<PublicArticleDTO> getArticlesByCategory(UUID categoryId, int page, int size) {
        List<Article> articles = articleMapper.findAll("PUBLISHED", null, categoryId, null, null, null, size,
                page * size);
        return articles.stream()
                .map(this::convertToPublicDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get article by slug for reading page
     */
    public PublicArticleDTO getArticleBySlug(String slug) {
        Article article = articleMapper.findBySlug(slug);
        if (article != null && article.getStatus() == Article.ArticleStatus.PUBLISHED) {
            return convertToPublicDTO(article);
        }
        return null;
    }

    /**
     * Search articles
     */
    public List<PublicArticleDTO> searchArticles(String query, int page, int size) {
        List<Article> articles = articleMapper.findAll("PUBLISHED", query, null, null, null, null, size, page * size);
        return articles.stream()
                .map(this::convertToPublicDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert Article to PublicArticleDTO
     */
    private PublicArticleDTO convertToPublicDTO(Article article) {
        PublicArticleDTO dto = new PublicArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSubtitle(article.getSubtitle());
        dto.setSlug(article.getSlug());
        dto.setExcerpt(article.getExcerpt());
        dto.setPublishedAt(article.getPublishedAt() != null ? article.getPublishedAt() : article.getCreatedAt());

        // Populate cover media URL
        if (article.getCoverMediaId() != null) {
            dto.setCoverMediaUrl(getCoverMediaUrl(article.getCoverMediaId()));
        }

        // Author info
        dto.setAuthorUserId(
                article.getAuthorUserId() != null ? article.getAuthorUserId() : article.getCreatedByUserId());
        dto.setAuthorName(article.getCreatedByEmail()); // TODO: Get actual author name from IAM

        // Tags
        if (article.getId() != null) {
            List<Tag> tags = tagMapper.findTagsByArticleId(article.getId());
            dto.setTags(tags.stream().map(Tag::getName).collect(Collectors.toList()));
        }

        // Engagement metrics (placeholder - would come from analytics service)
        dto.setLikes(0);
        dto.setComments(0);

        return dto;
    }

    /**
     * Get cover media URL from media ID
     */
    private String getCoverMediaUrl(UUID mediaId) {
        try {
            Path storageRoot = Paths.get("uploads").toAbsolutePath();
            if (Files.exists(storageRoot)) {
                try (var stream = Files.list(storageRoot)) {
                    return stream.filter(Files::isRegularFile)
                            .filter(path -> {
                                String filename = path.getFileName().toString();
                                UUID fileId = UUID.nameUUIDFromBytes(filename.getBytes());
                                return fileId.equals(mediaId);
                            })
                            .findFirst()
                            .map(path -> "/uploads/" + path.getFileName().toString())
                            .orElse(null);
                }
            }
        } catch (Exception e) {
            // Silently fail
        }
        return null;
    }
}
