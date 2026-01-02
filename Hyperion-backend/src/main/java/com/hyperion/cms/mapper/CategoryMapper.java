package com.hyperion.cms.mapper;

import com.hyperion.cms.model.Category;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Mapper
public interface CategoryMapper {
        @Select("SELECT * FROM categories ORDER BY name")
        List<Category> findAll();

        @Select("SELECT * FROM categories WHERE id = #{id}")
        Category findById(UUID id);

        @Select("SELECT * FROM categories WHERE slug = #{slug}")
        Category findBySlug(String slug);

        @Insert("INSERT INTO categories (id, parent_id, name, slug, seo_title, seo_description, position_config_json) "
                        +
                        "VALUES (#{id}, #{parentId}, #{name}, #{slug}, #{seoTitle}, #{seoDescription}, #{positionConfigJson})")
        void insert(Category category);

        @Update("UPDATE categories SET parent_id=#{parentId}, name=#{name}, slug=#{slug}, " +
                        "seo_title=#{seoTitle}, seo_description=#{seoDescription}, " +
                        "position_config_json=#{positionConfigJson}, updated_at=CURRENT_TIMESTAMP WHERE id=#{id}")
        void update(Category category);

        @Delete("DELETE FROM categories WHERE id = #{id}")
        void delete(UUID id);
}
