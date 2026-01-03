package com.hyperion.cms.mapper;

import com.hyperion.cms.model.SlugRedirect;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface SlugRedirectMapper {

    @Select("SELECT * FROM slug_redirects WHERE old_slug = #{slug} AND entity_type = #{entityType} LIMIT 1")
    SlugRedirect findByOldSlug(@Param("slug") String slug, @Param("entityType") String entityType);

    @Select("SELECT * FROM slug_redirects WHERE entity_id = #{entityId} AND entity_type = #{entityType} ORDER BY created_at DESC")
    List<SlugRedirect> findByEntity(@Param("entityId") UUID entityId, @Param("entityType") String entityType);

    @Insert("INSERT INTO slug_redirects (id, entity_type, entity_id, old_slug, new_slug, created_at) " +
            "VALUES (#{id}, #{entityType}, #{entityId}, #{oldSlug}, #{newSlug}, #{createdAt})")
    void insert(SlugRedirect redirect);

    @Delete("DELETE FROM slug_redirects WHERE entity_id = #{entityId} AND entity_type = #{entityType}")
    void deleteByEntity(@Param("entityId") UUID entityId, @Param("entityType") String entityType);
}
