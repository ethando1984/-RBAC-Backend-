package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.CrawlerMapper;
import com.hyperion.cms.model.CrawlerSource;
import com.hyperion.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/crawler")
public class CrawlerController {

    private final CrawlerMapper crawlerMapper;
    private final PermissionService permissionService;
    private final com.hyperion.cms.service.CrawlerService crawlerService;

    public CrawlerController(CrawlerMapper crawlerMapper, PermissionService permissionService,
            com.hyperion.cms.service.CrawlerService crawlerService) {
        this.crawlerMapper = crawlerMapper;
        this.permissionService = permissionService;
        this.crawlerService = crawlerService;
    }

    @GetMapping("/sources")
    public List<CrawlerSource> listSources() {
        if (!permissionService.can("crawler", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing crawler:read permission");
        }
        return crawlerMapper.findAllSources();
    }

    @PostMapping("/sources")
    public CrawlerSource createSource(@RequestBody CrawlerSource source) {
        if (!permissionService.can("crawler", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing crawler:write permission");
        }
        source.setId(UUID.randomUUID());
        source.setCreatedAt(LocalDateTime.now());
        if (source.getEnabled() == null)
            source.setEnabled(true);
        crawlerMapper.insertSource(source);
        return source;
    }

    @PutMapping("/sources/{id}")
    public CrawlerSource updateSource(@PathVariable UUID id, @RequestBody CrawlerSource source) {
        if (!permissionService.can("crawler", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing crawler:write permission");
        }
        source.setId(id);
        crawlerMapper.updateSource(source);
        return source;
    }

    @DeleteMapping("/sources/{id}")
    public void deleteSource(@PathVariable UUID id) {
        if (!permissionService.can("crawler", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing crawler:write permission");
        }
        crawlerMapper.deleteSource(id);
    }

    // Engine Endpoints

    @PostMapping("/sources/{id}/run")
    public void runCrawl(@PathVariable UUID id) {
        if (!permissionService.can("crawler", "execute")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing crawler:execute permission");
        }
        crawlerService.triggerCrawl(id);
    }

    @GetMapping("/jobs")
    public List<com.hyperion.cms.model.CrawlerJob> listJobs(@RequestParam UUID sourceId) {
        if (!permissionService.can("crawler", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing crawler:read permission");
        }
        return crawlerMapper.findJobsBySourceId(sourceId);
    }

    @GetMapping("/jobs/{id}/results")
    public List<com.hyperion.cms.model.CrawlerResult> listResults(@PathVariable UUID id) {
        if (!permissionService.can("crawler", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing crawler:read permission");
        }
        return crawlerMapper.findResultsByJobId(id);
    }

    @PostMapping("/results/{id}/convert")
    public java.util.Map<String, UUID> convertToDraft(@PathVariable UUID id) {
        if (!permissionService.can("articles", "create")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing articles:create permission");
        }
        String userId = permissionService.getCurrentUserId();
        UUID articleId = crawlerService.convertToDraft(id, userId);
        return java.util.Collections.singletonMap("articleId", articleId);
    }
}
