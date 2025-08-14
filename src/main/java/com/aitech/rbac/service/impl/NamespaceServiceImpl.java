package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.NamespaceMapper;
import com.aitech.rbac.model.Namespace;
import com.aitech.rbac.service.NamespaceService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class NamespaceServiceImpl implements NamespaceService {
    private final NamespaceMapper mapper;
    public NamespaceServiceImpl(NamespaceMapper mapper) { this.mapper = mapper; }

    public List<Namespace> getAll() { return mapper.findAll(); }
    public Namespace getById(UUID id) { return mapper.findById(id); }
    public void create(Namespace entity) { mapper.insert(entity); }
    public void update(Namespace entity) { mapper.update(entity); }
    public void delete(UUID id) { mapper.delete(id); }
}
