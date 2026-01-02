package com.hemera.cms.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class Task {
    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private String assignedToUserId;
    private String assignedToEmail;
    private UUID articleId;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    private String createdByUserId;
    private String createdByEmail;
    private String updatedByUserId;
    private String updatedByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum TaskStatus {
        TODO, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH, URGENT
    }
}
