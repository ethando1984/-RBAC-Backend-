package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Namespace;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface NamespaceMapper {
    List<Namespace> findAll();

    Namespace findById(UUID id);

    void insert(Namespace namespace);

    void update(Namespace namespace);

    void delete(UUID id);
}
