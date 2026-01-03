package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.TodoMapper;
import com.hyperion.cms.model.Todo;
import com.hyperion.cms.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoMapper todoMapper;
    private final PermissionService permissionService;

    public TodoController(TodoMapper todoMapper, PermissionService permissionService) {
        this.todoMapper = todoMapper;
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<Todo> list() {
        String userId = permissionService.getCurrentUserId();
        if ("anonymous".equals(userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
        }
        return todoMapper.findAllByUserId(userId);
    }

    @PostMapping
    public Todo create(@RequestBody Todo todo) {
        String userId = permissionService.getCurrentUserId();
        if ("anonymous".equals(userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
        }

        todo.setId(UUID.randomUUID());
        todo.setUserId(userId);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());

        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        todoMapper.insert(todo);
        return todo;
    }

    @PutMapping("/{id}")
    public Todo update(@PathVariable UUID id, @RequestBody Todo todo) {
        String userId = permissionService.getCurrentUserId();
        if ("anonymous".equals(userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
        }

        Todo existing = todoMapper.findById(id);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        if (!existing.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        existing.setTitle(todo.getTitle());
        existing.setCompleted(todo.isCompleted());
        existing.setUpdatedAt(LocalDateTime.now());

        todoMapper.update(existing);
        return existing;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        String userId = permissionService.getCurrentUserId();
        if ("anonymous".equals(userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
        }

        Todo existing = todoMapper.findById(id);
        if (existing == null)
            return;

        if (!existing.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        todoMapper.delete(id);
    }
}
