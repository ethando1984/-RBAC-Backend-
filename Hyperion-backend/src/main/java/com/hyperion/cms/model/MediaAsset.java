package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MediaAsset {
    public enum MediaType {
        IMAGE, VIDEO
    }

    private UUID id;
    private MediaType type;
    private String filename;
    private String mimeType;
    private Long sizeBytes;
    private String storageKey;
    private String url;
    private Integer width;
    private Integer height;
    private Integer durationSec;
    private String thumbnailKey;
    private String createdByUserId;
    private String createdByEmail;
    private LocalDateTime createdAt;
}
