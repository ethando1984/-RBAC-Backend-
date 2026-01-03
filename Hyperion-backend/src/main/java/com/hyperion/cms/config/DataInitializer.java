package com.hyperion.cms.config;

import com.hyperion.cms.mapper.*;
import com.hyperion.cms.model.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ArticleMapper articleMapper;
    private final StorylineMapper storylineMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final MediaAssetMapper mediaAssetMapper;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only run if the database is mostly empty (e.g., less than 10 articles)
        List<Article> existing = articleMapper.findAll("PUBLISHED", null, null, null, null, null, 10, 0);
        if (existing.size() > 5) {
            log.info("Database already populated with {} articles. Skipping bulk seeding.", existing.size());
            return;
        }

        log.info("Starting bulk data initialization (500 articles, 100 storylines)...");

        List<Category> categories = categoryMapper.findAll();
        List<Tag> tags = tagMapper.findAll();
        List<MediaAsset> mediaAssets = mediaAssetMapper.findAll();

        if (categories.isEmpty() || tags.isEmpty() || mediaAssets.isEmpty()) {
            log.warn("Missing base data (categories/tags/media). Please ensure data.sql has run first.");
            return;
        }

        List<Article> createdArticles = new ArrayList<>();

        // 1. Generate 500 Articles
        for (int i = 1; i <= 500; i++) {
            Article article = new Article();
            UUID articleId = UUID.randomUUID();
            article.setId(articleId);
            article.setTitle("Global Intelligence Report Vol. " + i + ": Trends in " + getRandomTechTerm());
            article.setSlug("intelligence-report-vol-" + i + "-" + UUID.randomUUID().toString().substring(0, 5));
            article.setExcerpt("Analyzing the latest shifts in global markets and technology, volume " + i
                    + " focuses on the impact of decentralized systems.");
            article.setContentHtml("<p>This is a generated report for volume " + i
                    + ". The landscape of modern industry is changing rapidly.</p>" +
                    "<p>Key findings suggest that <b>" + getRandomTechTerm()
                    + "</b> will be the primary driver of growth over the next decade. " +
                    "Strategic investments in this area are yielding 40% higher efficiency in early pilot programs.</p>"
                    +
                    "<p>Furthermore, the integration of " + getRandomTechTerm()
                    + " is reducing operational overhead by significant margins.</p>");
            article.setStatus(Article.ArticleStatus.PUBLISHED);

            // Random Media
            article.setCoverMediaId(mediaAssets.get(random.nextInt(mediaAssets.size())).getId());

            article.setPublishedAt(LocalDateTime.now().minusDays(random.nextInt(365)));
            article.setCreatedAt(article.getPublishedAt().minusHours(5));
            article.setCreatedByUserId("admin-001");
            article.setCreatedByEmail("admin@hyperion.com");

            articleMapper.insert(article);

            // Assign random category
            Category cat = categories.get(random.nextInt(categories.size()));
            articleMapper.addCategory(articleId, cat.getId(), true);

            // Assign 1-3 random tags
            Collections.shuffle(tags);
            int tagCount = 1 + random.nextInt(3);
            for (int t = 0; t < tagCount; t++) {
                tagMapper.addTagToArticle(articleId, tags.get(t).getId());
            }

            createdArticles.add(article);
            if (i % 100 == 0)
                log.info("Created {} articles...", i);
        }

        // 2. Generate 100 Storylines
        for (int i = 1; i <= 100; i++) {
            Storyline storyline = new Storyline();
            UUID storylineId = UUID.randomUUID();
            storyline.setId(storylineId);
            storyline.setTitle("The " + getRandomTopic() + " Evolution: Part " + i);
            storyline.setSlug("evolution-series-" + i + "-" + UUID.randomUUID().toString().substring(0, 5));
            storyline.setDescription("A comprehensive deep dive into the historical and future progression of "
                    + getRandomTopic().toLowerCase() + " technologies.");
            storyline.setStatus("ONGOING");
            storyline.setLayoutJson("{}");
            storyline.setCreatedByUserId("admin-001");
            storyline.setCreatedByEmail("admin@hyperion.com");
            storyline.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(30)));
            storyline.setUpdatedAt(LocalDateTime.now());

            // 1. Determine articles for this storyline
            Collections.shuffle(createdArticles);
            int articlesInStoryline = 3 + random.nextInt(6);
            List<Article> selectedArticles = new ArrayList<>(createdArticles.subList(0, articlesInStoryline));

            // 2. Build Contents JSON structure
            List<Map<String, Object>> contents = new ArrayList<>();

            // Add a lead text block
            Map<String, Object> leadBlock = new HashMap<>();
            leadBlock.put("id", UUID.randomUUID().toString());
            leadBlock.put("type", "text");
            leadBlock.put("content", storyline.getDescription());
            leadBlock.put("settings", new HashMap<>());
            contents.add(leadBlock);

            for (int a = 0; a < selectedArticles.size(); a++) {
                Article article = selectedArticles.get(a);

                // Add article block to contentsJson for the editor
                Map<String, Object> articleBlock = new HashMap<>();
                articleBlock.put("id", UUID.randomUUID().toString());
                articleBlock.put("type", "article");
                articleBlock.put("content", article.getId().toString());

                Map<String, Object> settings = new HashMap<>();
                settings.put("title", article.getTitle());
                settings.put("slug", article.getSlug());
                settings.put("excerpt", article.getExcerpt());
                articleBlock.put("settings", settings);

                contents.add(articleBlock);
            }

            try {
                storyline.setContentsJson(
                        new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(contents));
            } catch (Exception e) {
                storyline.setContentsJson("[]");
            }

            // 3. Insert Storyline record first (parent)
            storylineMapper.insert(storyline);

            // 4. Add mapping records to join table (children)
            for (int a = 0; a < selectedArticles.size(); a++) {
                storylineMapper.addArticle(selectedArticles.get(a).getId(), storylineId, a);
            }

            // 5. Add a hero media to storyline
            storylineMapper.addMedia(storylineId, mediaAssets.get(random.nextInt(mediaAssets.size())).getId(), "HERO",
                    0);
        }

        log.info("Successfully seeded 500 articles and 100 storylines.");
    }

    private String getRandomTechTerm() {
        String[] terms = { "Quantum Computing", "Edge AI", "Web3 Infrastructure", "Carbon Capture", "Bio-Digital Twins",
                "Hyper-Automation", "Neuromorphic Chips", "Smart Dust", "Post-Quantum Cryptography" };
        return terms[random.nextInt(terms.length)];
    }

    private String getRandomTopic() {
        String[] topics = { "Financial", "Technological", "Biological", "Deep Sea", "Space Exploration",
                "Digital Privacy", "Cyber Security", "Sustainable", "Automated" };
        return topics[random.nextInt(topics.length)];
    }
}
