package com.hyperion.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class Todo {
    private UUID id;
    private String title;
    private boolean completed;
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
