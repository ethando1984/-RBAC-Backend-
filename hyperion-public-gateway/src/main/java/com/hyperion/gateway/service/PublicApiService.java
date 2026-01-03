package com.hyperion.gateway.service;

import com.hyperion.gateway.client.CmsClient;
import com.hyperion.gateway.model.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicApiService {

    private static final Logger log = LoggerFactory.getLogger(PublicApiService.class);

    private final CmsClient cmsClient;

    @Cacheable(value = "articles", key = "#slug")
    public ArticleDto getArticle(String slug) {
        ArticleDto article = cmsClient.getArticleBySlug(slug);
        return enrichArticle(article);
    }

    @Cacheable(value = "home_data")
    public HomeResponse getHomeData() {
        HomeResponse response = new HomeResponse();
        response.setLayout(cmsClient.getHomeLayout());

        List<ArticleDto> latest = cmsClient.getArticles(0, 10, null, null);
        List<ArticleDto> enriched = latest.stream().map(this::enrichArticle).toList();
        response.setFeed(enriched);

        if (!enriched.isEmpty()) {
            response.setStaffPicks(List.of(enriched.get(0)));
        }

        List<CategoryDto> categories = cmsClient.getCategories();
        if (categories != null) {
            response.setRecommendedTopics(categories.stream().limit(6).toList());
        }

        return response;
    }

    @Cacheable(value = "articles_list", key = "{#page, #pageSize, #categorySlug, #tagSlug}")
    public List<ArticleDto> getArticles(int page, int pageSize, String categorySlug, String tagSlug) {
        List<ArticleDto> articles = cmsClient.getArticles(page, pageSize, categorySlug, tagSlug);
        return articles.stream().map(this::enrichArticle).collect(Collectors.toList());
    }

    public List<ArticleDto> searchArticles(String query, int page, int pageSize) {
        // In a real system, you would call OpenSearch/ElasticSearch here
        // For now, we delegate to internal search
        List<ArticleDto> results = cmsClient.getArticles(page, pageSize, null, null); // Simplified
        return results.stream()
                .filter(a -> a.getTitle().toLowerCase().contains(query.toLowerCase()))
                .map(this::enrichArticle)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "categories", key = "#slug")
    public CategoryDto getCategory(String slug) {
        return cmsClient.getCategoryBySlug(slug);
    }

    public List<CategoryDto> getCategoriesList() {
        return cmsClient.getCategories();
    }

    @Cacheable(value = "tags", key = "#slug")
    public TagDto getTag(String slug) {
        return cmsClient.getTagBySlug(slug);
    }

    @Cacheable(value = "storylines", key = "#slug")
    public StorylineDto getStoryline(String slug) {
        StorylineDto storyline = cmsClient.getStorylineBySlug(slug);
        if (storyline != null && storyline.getArticles() != null) {
            storyline.setArticles(storyline.getArticles().stream()
                    .map(this::enrichArticle)
                    .collect(Collectors.toList()));
        }
        return storyline;
    }

    @Cacheable(value = "storylines_list", key = "{#page, #pageSize}")
    public List<StorylineDto> getStorylinesList(int page, int pageSize) {
        return cmsClient.getStorylines(page, pageSize);
    }

    private ArticleDto enrichArticle(ArticleDto article) {
        if (article == null)
            return null;

        // Populate Categories from IDs
        if (article.getCategoryIds() != null && !article.getCategoryIds().isEmpty()) {
            List<CategoryDto> allCategories = cmsClient.getCategories();
            if (allCategories != null) {
                article.setCategories(allCategories.stream()
                        .filter(c -> article.getCategoryIds().contains(c.getId()))
                        .collect(Collectors.toList()));
            }
        }

        // Populate Tags from Names
        if (article.getTagNames() != null && !article.getTagNames().isEmpty()) {
            article.setTags(article.getTagNames().stream().map(name -> {
                TagDto tag = new TagDto();
                tag.setName(name);
                tag.setSlug(name.toLowerCase().replaceAll("[^a-z0-9]", "-"));
                return tag;
            }).collect(Collectors.toList()));
        }

        // Compute read time
        if (article.getContentHtml() != null) {
            int words = article.getContentHtml().split("\\s+").length;
            article.setReadTime((int) Math.ceil(words / 200.0));
        }

        // Excerpt generation if missing
        if ((article.getExcerpt() == null || article.getExcerpt().isEmpty()) && article.getContentHtml() != null) {
            String text = article.getContentHtml().replaceAll("<[^>]*>", "");
            article.setExcerpt(text.length() > 160 ? text.substring(0, 157) + "..." : text);
        }

        // Ensure media variants are present
        if (article.getCoverMediaUrl() != null
                && (article.getMediaVariants() == null || article.getMediaVariants().isEmpty())) {
            ArticleDto.MediaVariant thumb = new ArticleDto.MediaVariant();
            thumb.setType("thumbnail");
            thumb.setUrl(article.getCoverMediaUrl() + "?w=300");

            ArticleDto.MediaVariant hero = new ArticleDto.MediaVariant();
            hero.setType("hero");
            hero.setUrl(article.getCoverMediaUrl() + "?w=1200");

            article.setMediaVariants(List.of(thumb, hero));
        }

        return article;
    }
}
