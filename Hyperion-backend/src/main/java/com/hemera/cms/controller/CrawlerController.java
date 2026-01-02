package com.hemera.cms.controller;

import com.hemera.cms.mapper.CrawlerMapper;
import com.hemera.cms.model.CrawlerSource;
import com.hemera.cms.security.PermissionService;
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

    public CrawlerController(CrawlerMapper crawlerMapper, PermissionService permissionService) {
        this.crawlerMapper = crawlerMapper;
        this.permissionService = permissionService;
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
}
