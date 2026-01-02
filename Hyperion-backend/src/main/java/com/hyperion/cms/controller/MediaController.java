package com.hyperion.cms.controller;

import com.hyperion.cms.security.PermissionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.ZoneId;
import java.nio.file.attribute.FileTime;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MediaController.class);
    private final PermissionService permissionService;
    // Simple local storage for MVP
    private final Path storageRoot = Paths.get("uploads").toAbsolutePath();

    public MediaController(PermissionService permissionService) {
        this.permissionService = permissionService;
        try {
            Files.createDirectories(storageRoot);
            log.info("Initialized media storage at: {}", storageRoot);
        } catch (IOException e) {
            log.error("Failed to initialize storage", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        // Basic check
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot upload empty file");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null)
            originalFilename = "unknown";

        // Sanitize filename
        String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
        String filename = UUID.randomUUID().toString().substring(0, 8) + "-" + cleanName;

        Path destination = storageRoot.resolve(filename);

        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        log.info("Successfully uploaded media: {} -> {}", originalFilename, filename);

        // In real app: save to DB (media_assets table)
        return Map.of(
                "id", UUID.nameUUIDFromBytes(filename.getBytes()),
                "url", "/uploads/" + filename,
                "filename", originalFilename,
                "size", file.getSize(),
                "createdAt", LocalDateTime.now());
    }

    @GetMapping
    public List<Map<String, Object>> list() throws IOException {
        if (!Files.exists(storageRoot)) {
            Files.createDirectories(storageRoot);
            return List.of();
        }

        try (var stream = Files.list(storageRoot)) {
            return stream
                    .filter(Files::isRegularFile)
                    .map(path -> {
                        try {
                            String filename = path.getFileName().toString();
                            Map<String, Object> media = new HashMap<>();
                            media.put("id", UUID.nameUUIDFromBytes(filename.getBytes()));
                            media.put("url", "/uploads/" + filename);
                            media.put("filename", filename);
                            media.put("size", Files.size(path));
                            media.put("createdAt", LocalDateTime.ofInstant(Files.getLastModifiedTime(path).toInstant(),
                                    ZoneId.systemDefault()));
                            return media;
                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(java.util.Objects::nonNull)
                    .sorted((a, b) -> ((java.time.LocalDateTime) b.get("createdAt"))
                            .compareTo((java.time.LocalDateTime) a.get("createdAt")))
                    .toList();
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) throws IOException {
        Path target;
        try (var stream = Files.list(storageRoot)) {
            target = stream
                    .filter(Files::isRegularFile)
                    .filter(path -> UUID.nameUUIDFromBytes(path.getFileName().toString().getBytes()).equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("File not found with ID: " + id));
        }
        Files.delete(target);
        log.info("Deleted media file: {}", target.getFileName());
    }

    @PutMapping("/{id}")
    public Map<String, Object> replace(@PathVariable UUID id, @RequestParam("file") MultipartFile file)
            throws IOException {
        log.info("Replacing media asset: {}", id);
        delete(id);
        return upload(file);
    }
}
