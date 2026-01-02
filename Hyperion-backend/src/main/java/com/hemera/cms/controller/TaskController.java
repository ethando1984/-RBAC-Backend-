package com.hemera.cms.controller;

import com.hemera.cms.mapper.TaskMapper;
import com.hemera.cms.model.Task;
import com.hemera.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskMapper taskMapper;
    private final PermissionService permissionService;

    public TaskController(TaskMapper taskMapper, PermissionService permissionService) {
        this.taskMapper = taskMapper;
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<Task> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedToUserId,
            @RequestParam(required = false) String createdByUserId,
            @RequestParam(required = false) UUID articleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (!permissionService.can("tasks", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing tasks:read permission");
        }
        return taskMapper.findAll(status, assignedToUserId, createdByUserId, articleId, page * size, size);
    }

    @GetMapping("/{id}")
    public Task get(@PathVariable UUID id) {
        if (!permissionService.can("tasks", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing tasks:read permission");
        }
        Task task = taskMapper.findById(id);
        if (task == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return task;
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        if (!permissionService.can("tasks", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing tasks:write permission");
        }
        task.setId(UUID.randomUUID());
        task.setCreatedAt(LocalDateTime.now());
        task.setCreatedByUserId(permissionService.getCurrentUserId());
        task.setCreatedByEmail(permissionService.getCurrentUserEmail());
        if (task.getStatus() == null)
            task.setStatus(Task.TaskStatus.TODO);
        if (task.getPriority() == null)
            task.setPriority(Task.TaskPriority.MEDIUM);
        taskMapper.insert(task);
        return task;
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable UUID id, @RequestBody Task task) {
        if (!permissionService.can("tasks", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing tasks:write permission");
        }
        Task existing = taskMapper.findById(id);
        if (existing == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        task.setId(id);
        task.setUpdatedAt(LocalDateTime.now());
        task.setUpdatedByUserId(permissionService.getCurrentUserId());
        task.setUpdatedByEmail(permissionService.getCurrentUserEmail());

        // Auto-set completedAt when status changes to COMPLETED
        if (task.getStatus() == Task.TaskStatus.COMPLETED && existing.getStatus() != Task.TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        }

        taskMapper.update(task);
        return task;
    }

    @PatchMapping("/{id}/status")
    public Task updateStatus(@PathVariable UUID id, @RequestParam String status) {
        if (!permissionService.can("tasks", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing tasks:write permission");
        }
        Task task = taskMapper.findById(id);
        if (task == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        task.setStatus(Task.TaskStatus.valueOf(status));
        task.setUpdatedAt(LocalDateTime.now());
        task.setUpdatedByUserId(permissionService.getCurrentUserId());
        task.setUpdatedByEmail(permissionService.getCurrentUserEmail());

        if (task.getStatus() == Task.TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        }

        taskMapper.update(task);
        return task;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        if (!permissionService.can("tasks", "write")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing tasks:write permission");
        }
        taskMapper.delete(id);
    }

    @GetMapping("/stats")
    public java.util.Map<String, Integer> getStats() {
        if (!permissionService.can("tasks", "read")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing tasks:read permission");
        }
        return java.util.Map.of(
                "TODO", taskMapper.countByStatus("TODO"),
                "IN_PROGRESS", taskMapper.countByStatus("IN_PROGRESS"),
                "COMPLETED", taskMapper.countByStatus("COMPLETED"),
                "CANCELLED", taskMapper.countByStatus("CANCELLED"));
    }
}
