package com.hyperion.cms.mapper;

import com.hyperion.cms.model.Tag;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface TagMapper {

    @Select("SELECT * FROM tags ORDER BY name ASC")
    List<Tag> findAll();

    @Select("SELECT * FROM tags WHERE id = #{id}")
    Tag findById(UUID id);

    @Select("SELECT * FROM tags WHERE slug = #{slug}")
    Tag findBySlug(String slug);

    @Select("SELECT * FROM tags WHERE name = #{name}")
    Tag findByName(String name);

    @Insert("INSERT INTO tags (id, name, slug, description, created_at) " +
            "VALUES (#{id}, #{name}, #{slug}, #{description}, #{createdAt})")
    void insert(Tag tag);

    @Update("UPDATE tags SET name=#{name}, slug=#{slug}, description=#{description} WHERE id=#{id}")
    void update(Tag tag);

    @Delete("DELETE FROM tags WHERE id = #{id}")
    void delete(UUID id);

    @Insert("INSERT INTO article_tags (article_id, tag_id) VALUES (#{articleId}, #{tagId})")
    void addTagToArticle(@Param("articleId") UUID articleId, @Param("tagId") UUID tagId);

    @Delete("DELETE FROM article_tags WHERE article_id = #{articleId} AND tag_id = #{tagId}")
    void removeTagFromArticle(@Param("articleId") UUID articleId, @Param("tagId") UUID tagId);

    @Delete("DELETE FROM article_tags WHERE article_id = #{articleId}")
    void removeAllTagsFromArticle(UUID articleId);

    @Select("SELECT t.* FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = #{articleId}")
    List<Tag> findTagsByArticleId(UUID articleId);

    @Select("SELECT article_id FROM article_tags WHERE tag_id = #{tagId}")
    List<UUID> findArticleIdsByTagId(UUID tagId);
}
