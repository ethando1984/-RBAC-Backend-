package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Namespace;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface NamespaceMapper {
    @Select("SELECT * FROM namespaces")
    List<Namespace> findAll();

    @Select("SELECT * FROM namespaces WHERE namespace_id = #{id}")
    Namespace findById(UUID id);

    @Insert("INSERT INTO namespaces(namespace_id, namespace_key, description) " +
            "VALUES(#{namespaceId}, #{namespaceKey}, #{description})")
    void insert(Namespace namespace);

    @Update("UPDATE namespaces SET namespace_key=#{namespaceKey}, description=#{description} WHERE namespace_id=#{namespaceId}")
    void update(Namespace namespace);

    @Delete("DELETE FROM namespaces WHERE namespace_id=#{id}")
    void delete(UUID id);
}
