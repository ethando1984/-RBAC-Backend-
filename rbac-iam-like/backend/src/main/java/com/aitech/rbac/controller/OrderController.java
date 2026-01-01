package com.aitech.rbac.controller;

import com.aitech.rbac.model.Order;
import com.aitech.rbac.mapper.OrderMapper;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderMapper mapper;

    public OrderController(OrderMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping
    public List<Order> getAll() {
        return mapper.findAll();
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable UUID id) {
        return mapper.findById(id);
    }

    @PostMapping
    public void create(@RequestBody Order entity) {
        if (entity.getOrderId() == null)
            entity.setOrderId(UUID.randomUUID());
        if (entity.getOrderDate() == null)
            entity.setOrderDate(LocalDateTime.now());
        mapper.insert(entity);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable UUID id, @RequestBody Order entity) {
        entity.setOrderId(id);
        mapper.update(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        mapper.delete(id);
    }
}
