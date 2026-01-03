package com.hyperion.gateway.client;

import com.hyperion.gateway.model.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class CmsClient {

    private final RestClient restClient;

    public CmsClient(@org.springframework.beans.factory.annotation.Qualifier("cmsRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public ArticleDto getArticleBySlug(String slug) {
        return restClient.get()
                .uri("/api/internal/public/articles/{slug}", slug)
                .retrieve()
                .body(ArticleDto.class);
    }

    public List<ArticleDto> getArticles(int page, int pageSize, String categorySlug, String tagSlug) {
        String uri = "/api/internal/public/articles?page=" + page + "&pageSize=" + pageSize;
        if (categorySlug != null && !categorySlug.equals("null")) {
            uri += "&category=" + categorySlug;
        }
        if (tagSlug != null && !tagSlug.equals("null")) {
            uri += "&tag=" + tagSlug;
        }

        return restClient.get()
                .uri(uri)
                .retrieve()
                .body(new ParameterizedTypeReference<List<ArticleDto>>() {
                });
    }

    public List<CategoryDto> getCategories() {
        return restClient.get()
                .uri("/api/internal/public/categories")
                .retrieve()
                .body(new ParameterizedTypeReference<List<CategoryDto>>() {
                });
    }

    public Object getHomeLayout() {
        return restClient.get()
                .uri("/api/internal/public/layouts/homepage")
                .retrieve()
                .body(Object.class);
    }

    public CategoryDto getCategoryBySlug(String slug) {
        return restClient.get()
                .uri("/api/internal/public/categories/{slug}", slug)
                .retrieve()
                .body(CategoryDto.class);
    }

    public TagDto getTagBySlug(String slug) {
        return restClient.get()
                .uri("/api/internal/public/tags/{slug}", slug)
                .retrieve()
                .body(TagDto.class);
    }

    public StorylineDto getStorylineBySlug(String slug) {
        return restClient.get()
                .uri("/api/internal/public/storylines/{slug}", slug)
                .retrieve()
                .body(StorylineDto.class);
    }

    public List<StorylineDto> getStorylines(int page, int pageSize) {
        return restClient.get()
                .uri("/api/internal/public/storylines?page=" + page + "&pageSize=" + pageSize)
                .retrieve()
                .body(new ParameterizedTypeReference<List<StorylineDto>>() {
                });
    }
}
