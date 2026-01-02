package com.aitech.rbac.controller;

import com.aitech.rbac.dto.ActionTypeDTO;
import com.aitech.rbac.model.ActionType;
import com.aitech.rbac.service.ActionTypeService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/action-types")
public class ActionTypeController {
    private final ActionTypeService service;

    public ActionTypeController(ActionTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<ActionType> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ActionType getById(@PathVariable("id") UUID id) {
        return service.getById(id);
    }

    @PostMapping
    public void create(@RequestBody ActionTypeDTO dto) {
        ActionType entity = new ActionType();
        entity.setActionTypeId(UUID.randomUUID());
        entity.setActionKey(dto.getActionKey());
        entity.setDescription(dto.getDescription());
        service.create(entity);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable("id") UUID id, @RequestBody ActionTypeDTO dto) {
        ActionType entity = new ActionType();
        entity.setActionTypeId(id);
        entity.setActionKey(dto.getActionKey());
        entity.setDescription(dto.getDescription());
        service.update(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") UUID id) {
        service.delete(id);
    }
}
