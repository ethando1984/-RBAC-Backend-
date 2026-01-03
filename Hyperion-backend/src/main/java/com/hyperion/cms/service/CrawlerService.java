package com.hyperion.cms.service;

import com.hyperion.cms.mapper.CrawlerMapper;
import com.hyperion.cms.mapper.ArticleMapper;
import com.hyperion.cms.model.CrawlerJob;
import com.hyperion.cms.model.CrawlerResult;
import com.hyperion.cms.model.CrawlerSource;
import com.hyperion.cms.model.Article;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CrawlerService {
    private static final Logger log = LoggerFactory.getLogger(CrawlerService.class);

    private final CrawlerMapper crawlerMapper;
    private final ArticleMapper articleMapper;

    public CrawlerService(CrawlerMapper crawlerMapper, ArticleMapper articleMapper) {
        this.crawlerMapper = crawlerMapper;
        this.articleMapper = articleMapper;
    }

    @Async
    public void triggerCrawl(UUID sourceId) {
        CrawlerSource source = crawlerMapper.findSourceById(sourceId);
        if (source == null) {
            log.error("Source not found: {}", sourceId);
            return;
        }

        CrawlerJob job = new CrawlerJob();
        job.setId(UUID.randomUUID());
        job.setSourceId(sourceId);
        job.setStatus("RUNNING");
        job.setStartedAt(LocalDateTime.now());
        crawlerMapper.insertJob(job);

        try {
            log.info("Starting crawl for source: {}", source.getName());
            URL feedUrl = new URL(source.getBaseUrl());
            SyndFeedInput input = new SyndFeedInput();
            SyndFeed feed = input.build(new XmlReader(feedUrl));

            for (SyndEntry entry : feed.getEntries()) {
                try {
                    String url = entry.getLink();
                    String title = entry.getTitle();

                    // Simple logic: fetch connect logic
                    Document doc = Jsoup.connect(url)
                            .userAgent(
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                            .timeout(10000)
                            .get();

                    // Rudimentary content extraction (can use templates later)
                    // Trying to find article body
                    String contentHtml = "";
                    if (doc.select("article").first() != null) {
                        contentHtml = doc.select("article").html();
                    } else if (doc.select(".post-content").first() != null) {
                        contentHtml = doc.select(".post-content").html();
                    } else if (doc.select("main").first() != null) {
                        contentHtml = doc.select("main").html();
                    } else {
                        contentHtml = doc.body().html();
                    }

                    CrawlerResult result = new CrawlerResult();
                    result.setId(UUID.randomUUID());
                    result.setJobId(job.getId());
                    result.setUrl(url);
                    result.setExtractedTitle(title);
                    result.setExtractedHtml(contentHtml);
                    result.setReviewStatus("PENDING");

                    crawlerMapper.insertResult(result);

                } catch (Exception e) {
                    log.error("Failed to process entry: " + entry.getLink(), e);
                }
            }

            job.setStatus("COMPLETED");
            job.setFinishedAt(LocalDateTime.now());
            crawlerMapper.updateJob(job);

        } catch (Exception e) {
            log.error("Crawl failed for source: " + sourceId, e);
            job.setStatus("FAILED");
            job.setFinishedAt(LocalDateTime.now());
            crawlerMapper.updateJob(job);
        }
    }

    public UUID convertToDraft(UUID resultId, String userId) {
        CrawlerResult result = crawlerMapper.findResultById(resultId);
        if (result == null) {
            throw new RuntimeException("Result not found");
        }

        Article article = new Article();
        UUID articleId = UUID.randomUUID();
        article.setId(articleId);
        article.setTitle(result.getExtractedTitle());
        article.setSlug("draft-" + UUID.randomUUID().toString().substring(0, 8)); // Temporary slug
        article.setContentHtml(result.getExtractedHtml());
        article.setStatus(Article.ArticleStatus.DRAFT);
        article.setCreatedByUserId(userId);
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        article.setSourceUrl(result.getUrl());
        article.setSourceName("Crawler Import");

        articleMapper.insert(article);

        result.setReviewStatus("CONVERTED"); // Should define this constant
        result.setReviewedByUserId(userId);
        result.setReviewedAt(LocalDateTime.now());
        crawlerMapper.updateResult(result);

        return articleId;
    }
}
