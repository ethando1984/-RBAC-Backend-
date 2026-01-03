package com.hyperion.gateway;

import com.hyperion.gateway.client.CmsClient;
import com.hyperion.gateway.model.ArticleDto;
import com.hyperion.gateway.service.PublicApiService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;

@SpringBootTest
public class PublicApiServiceTest {

    @Autowired
    private PublicApiService publicApiService;

    @MockBean
    private CmsClient cmsClient;

    @Autowired
    private CacheManager cacheManager;

    @Test
    public void testArticleCaching() {
        String slug = "test-article";
        ArticleDto article = new ArticleDto();
        article.setSlug(slug);
        article.setTitle("Test Title");

        Mockito.when(cmsClient.getArticleBySlug(slug)).thenReturn(article);

        // First call - should go to client
        ArticleDto result1 = publicApiService.getArticle(slug);
        assertNotNull(result1);
        Mockito.verify(cmsClient, Mockito.times(1)).getArticleBySlug(slug);

        // Second call - should come from cache
        ArticleDto result2 = publicApiService.getArticle(slug);
        assertNotNull(result2);
        Mockito.verify(cmsClient, Mockito.times(1)).getArticleBySlug(slug); // Still 1 call

        assertEquals(result1.getTitle(), result2.getTitle());
    }
}
