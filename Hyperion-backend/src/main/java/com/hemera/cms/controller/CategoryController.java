package com.hemera.cms.controller;

import com.hemera.cms.mapper.CategoryMapper;
import com.hemera.cms.model.Category;
import com.hemera.cms.security.PermissionService;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryMapper categoryMapper;
    private final PermissionService permissionService;

    public CategoryController(CategoryMapper categoryMapper, PermissionService permissionService) {
        this.categoryMapper = categoryMapper;
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<?> list(@RequestParam(defaultValue = "false") boolean flat) {
        if (!permissionService.can("categories", "read")) {
            throw new RuntimeException("Access Denied: Requires categories:read");
        }
        List<Category> allCategoriesObj = categoryMapper.findAll();

        if (flat) {
            return allCategoriesObj;
        }

        // Convert to Map for hierarchical processing and dynamic field attachment
        List<Map<String, Object>> allCategories = allCategoriesObj.stream().map(cat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", cat.getId());
            map.put("parentId", cat.getParentId());
            map.put("name", cat.getName());
            map.put("slug", cat.getSlug());
            map.put("seoTitle", cat.getSeoTitle());
            map.put("seoDescription", cat.getSeoDescription());
            map.put("positionConfigJson", cat.getPositionConfigJson());
            return map;
        }).toList();

        // Build hierarchical structure
        Map<String, List<Map<String, Object>>> childrenMap = new HashMap<>();
        List<Map<String, Object>> rootCategories = new ArrayList<>();

        // First pass: identify root categories and group children
        for (Map<String, Object> category : allCategories) {
            Object parentId = category.get("parentId");
            if (parentId == null) {
                rootCategories.add(category);
            } else {
                String parentIdStr = parentId.toString();
                childrenMap.computeIfAbsent(parentIdStr, k -> new ArrayList<>()).add(category);
            }
        }

        // Second pass: attach children to parents
        for (Map<String, Object> category : allCategories) {
            String categoryId = category.get("id").toString();
            List<Map<String, Object>> children = childrenMap.get(categoryId);
            if (children != null && !children.isEmpty()) {
                // Keep the 'sub' name list for backward compatibility with the tree view
                List<String> subNames = children.stream()
                        .map(child -> (String) child.get("name"))
                        .collect(Collectors.toList());
                category.put("sub", subNames);
                // Also add full objects as 'children' for the hierarchical tree view
                category.put("children", children);
            }
        }

        return rootCategories;
    }

    @GetMapping("/{id}")
    public Category get(@PathVariable UUID id) {
        if (!permissionService.can("categories", "read")) {
            throw new RuntimeException("Access Denied: Requires categories:read");
        }
        return categoryMapper.findById(id);
    }

    @PostMapping
    public Category create(@RequestBody Category category) {
        if (!permissionService.can("categories", "manage")) {
            throw new RuntimeException("Access Denied: Requires categories:manage");
        }
        if (category.getId() == null) {
            category.setId(UUID.randomUUID());
        }

        String baseSlug = category.getSlug();
        if (baseSlug == null || baseSlug.isEmpty()) {
            baseSlug = category.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        }

        category.setSlug(ensureUniqueSlug(baseSlug));

        categoryMapper.insert(category);
        return category;
    }

    private String ensureUniqueSlug(String slug) {
        String uniqueSlug = slug;
        int count = 1;
        while (categoryMapper.findBySlug(uniqueSlug) != null) {
            uniqueSlug = slug + "-" + UUID.randomUUID().toString().substring(0, 4);
            // Safety break just in case
            if (count++ > 10)
                break;
        }
        return uniqueSlug;
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable UUID id, @RequestBody Category category) {
        if (!permissionService.can("categories", "manage")) {
            throw new RuntimeException("Access Denied: Requires categories:manage");
        }
        category.setId(id);
        categoryMapper.update(category);
        return category;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        if (!permissionService.can("categories", "manage")) {
            throw new RuntimeException("Access Denied: Requires categories:manage");
        }
        categoryMapper.delete(id);
    }
}
