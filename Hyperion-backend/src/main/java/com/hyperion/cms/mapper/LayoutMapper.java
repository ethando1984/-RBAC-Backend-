package com.hyperion.cms.mapper;

import com.hyperion.cms.model.Layout;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface LayoutMapper {

    @Select("SELECT * FROM layouts ORDER BY type, name")
    List<Layout> findAll();

    @Select("SELECT * FROM layouts WHERE id = #{id}")
    Layout findById(UUID id);

    @Select("SELECT * FROM layouts WHERE slug = #{slug} AND type = 'STANDALONE'")
    Layout findBySlug(String slug);

    @Select("SELECT * FROM layouts WHERE type = #{type} AND (target_id = #{targetId} OR is_default = true) ORDER BY is_default ASC LIMIT 1")
    Layout findForTarget(@Param("type") String type, @Param("targetId") String targetId);

    @Select("SELECT * FROM layouts WHERE type = 'HOMEPAGE' AND is_active = true LIMIT 1")
    Layout findHomepage();

    @Insert("INSERT INTO layouts (id, name, slug, type, target_id, config_json, is_default, is_active, created_at, updated_at, created_by_user_id, updated_by_user_id) "
            +
            "VALUES (#{id}, #{name}, #{slug}, #{type}, #{targetId}, #{configJson}, #{isDefault}, #{isActive}, #{createdAt}, #{updatedAt}, #{createdByUserId}, #{updatedByUserId})")
    void insert(Layout layout);

    @Update("UPDATE layouts SET name=#{name}, slug=#{slug}, target_id=#{targetId}, config_json=#{configJson}, " +
            "is_default=#{isDefault}, is_active=#{isActive}, updated_at=#{updatedAt}, updated_by_user_id=#{updatedByUserId} "
            +
            "WHERE id=#{id}")
    void update(Layout layout);

    @Delete("DELETE FROM layouts WHERE id = #{id}")
    void delete(UUID id);
}
