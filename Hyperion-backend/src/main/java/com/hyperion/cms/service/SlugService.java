package com.hyperion.cms.service;

import com.hyperion.cms.mapper.ArticleMapper;
import com.hyperion.cms.mapper.CategoryMapper;
import com.hyperion.cms.mapper.StorylineMapper;
import com.hyperion.cms.mapper.TagMapper;
import com.hyperion.cms.mapper.SlugRedirectMapper;
import com.hyperion.cms.model.SlugRedirect;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SlugService {

    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final StorylineMapper storylineMapper;
    private final TagMapper tagMapper;
    private final SlugRedirectMapper slugRedirectMapper;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGESDHASHES = Pattern.compile("(^-|-$)");

    public String toAsciiSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "untitled";
        }

        // Special handling for Vietnamese 'đ' and 'Đ'
        String normalized = input.replace("đ", "d").replace("Đ", "D");

        // Normalize Unicode (NFD) and remove combining marks
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{M}", "");

        // Convert to lowercase and handle whitespace/non-alphanumeric
        normalized = WHITESPACE.matcher(normalized).replaceAll("-");
        normalized = normalized.toLowerCase();
        normalized = NONLATIN.matcher(normalized).replaceAll("");
        normalized = normalized.replaceAll("-+", "-");
        normalized = EDGESDHASHES.matcher(normalized).replaceAll("");

        if (normalized.length() > 120) {
            normalized = normalized.substring(0, 120);
            normalized = EDGESDHASHES.matcher(normalized).replaceAll("");
        }

        return normalized.isEmpty() ? "untitled" : normalized;
    }

    public String ensureUniqueSlug(String entityType, String slugBase, UUID entityId) {
        String slug = slugBase;
        int counter = 2;

        while (isSlugExists(entityType, slug, entityId)) {
            String suffix = "-" + counter;
            if (slugBase.length() + suffix.length() > 120) {
                slug = slugBase.substring(0, 120 - suffix.length()) + suffix;
            } else {
                slug = slugBase + suffix;
            }
            counter++;
        }

        return slug;
    }

    private boolean isSlugExists(String entityType, String slug, UUID entityId) {
        boolean exists = false;
        switch (entityType.toUpperCase()) {
            case "ARTICLE":
                var a = articleMapper.findBySlug(slug);
                exists = a != null && !a.getId().equals(entityId);
                break;
            case "CATEGORY":
                var c = categoryMapper.findBySlug(slug);
                exists = c != null && !c.getId().equals(entityId);
                break;
            case "STORYLINE":
                var s = storylineMapper.findBySlug(slug);
                exists = s != null && !s.getId().equals(entityId);
                break;
            case "TAG":
                var t = tagMapper.findBySlug(slug);
                exists = t != null && !t.getId().equals(entityId);
                break;
        }
        return exists;
    }

    public void handleSlugChange(String entityType, UUID entityId, String oldSlug, String newSlug) {
        if (oldSlug == null || newSlug == null || oldSlug.equals(newSlug)) {
            return;
        }

        SlugRedirect redirect = new SlugRedirect();
        redirect.setId(UUID.randomUUID());
        redirect.setEntityType(entityType.toUpperCase());
        redirect.setEntityId(entityId);
        redirect.setOldSlug(oldSlug);
        redirect.setNewSlug(newSlug);
        redirect.setCreatedAt(LocalDateTime.now());

        slugRedirectMapper.insert(redirect);
    }
}
