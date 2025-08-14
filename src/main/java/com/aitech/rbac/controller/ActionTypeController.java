package com.aitech.rbac.controller;

import com.aitech.rbac.model.ActionType;
import com.aitech.rbac.service.ActionTypeService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/action_types")
public class ActionTypeController {
    private final ActionTypeService service;
    public ActionTypeController(ActionTypeService service) { this.service = service; }

    @GetMapping public List<ActionType> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public ActionType getById(@PathVariable UUID id) { return service.getById(id); }
    @PostMapping public void create(@RequestBody ActionType entity) { service.create(entity); }
    @PutMapping("/{id}") public void update(@PathVariable UUID id, @RequestBody ActionType entity) { service.update(entity); }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { service.delete(id); }
}
