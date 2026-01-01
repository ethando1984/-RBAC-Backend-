package com.aitech.rbac.controller;

import com.aitech.rbac.model.Product;
import com.aitech.rbac.mapper.ProductMapper;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final ProductMapper mapper;

    public InventoryController(ProductMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping
    public List<Product> getAll() {
        return mapper.findAll();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable UUID id) {
        return mapper.findById(id);
    }

    @PostMapping
    public void create(@RequestBody Product entity) {
        if (entity.getProductId() == null)
            entity.setProductId(UUID.randomUUID());
        mapper.insert(entity);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable UUID id, @RequestBody Product entity) {
        entity.setProductId(id);
        mapper.update(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        mapper.delete(id);
    }
}
