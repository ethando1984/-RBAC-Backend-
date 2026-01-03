package com.hyperion.cms.controller;

import com.hyperion.cms.mapper.CategoryMapper;
import com.hyperion.cms.model.Category;
import com.hyperion.cms.security.PermissionService;
import com.hyperion.cms.security.RequirePermission;
import com.hyperion.cms.service.SlugService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryMapper categoryMapper;
    private final PermissionService permissionService;
    private final SlugService slugService;

    public CategoryController(CategoryMapper categoryMapper, PermissionService permissionService,
            SlugService slugService) {
        this.categoryMapper = categoryMapper;
        this.permissionService = permissionService;
        this.slugService = slugService;
    }

    @GetMapping
    @RequirePermission(namespace = "categories", action = "read")
    public List<?> list(@RequestParam(defaultValue = "false") boolean flat) {
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
        }).collect(Collectors.toList());

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
    @RequirePermission(namespace = "categories", action = "read")
    public Category get(@PathVariable UUID id) {
        return categoryMapper.findById(id);
    }

    @PostMapping
    @RequirePermission(namespace = "categories", action = "manage")
    public Category create(@RequestBody Category category) {
        if (category.getId() == null) {
            category.setId(UUID.randomUUID());
        }

        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            String slugBase = slugService.toAsciiSlug(category.getName());
            category.setSlug(slugService.ensureUniqueSlug("CATEGORY", slugBase, category.getId()));
        } else {
            category.setSlug(slugService.toAsciiSlug(category.getSlug()));
            category.setSlug(slugService.ensureUniqueSlug("CATEGORY", category.getSlug(), category.getId()));
        }

        categoryMapper.insert(category);
        return category;
    }

    @PutMapping("/{id}")
    @RequirePermission(namespace = "categories", action = "manage")
    public Category update(@PathVariable UUID id, @RequestBody Category category) {
        Category existing = categoryMapper.findById(id);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        String oldSlug = existing.getSlug();
        category.setId(id);

        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            if (!category.getName().equals(existing.getName())) {
                String slugBase = slugService.toAsciiSlug(category.getName());
                category.setSlug(slugService.ensureUniqueSlug("CATEGORY", slugBase, id));
            } else {
                category.setSlug(oldSlug);
            }
        } else {
            category.setSlug(slugService.toAsciiSlug(category.getSlug()));
            category.setSlug(slugService.ensureUniqueSlug("CATEGORY", category.getSlug(), id));
        }

        if (!category.getSlug().equals(oldSlug)) {
            slugService.handleSlugChange("CATEGORY", id, oldSlug, category.getSlug());
        }

        categoryMapper.update(category);
        return category;
    }

    @DeleteMapping("/{id}")
    @RequirePermission(namespace = "categories", action = "manage")
    public void delete(@PathVariable UUID id) {
        categoryMapper.delete(id);
    }
}
