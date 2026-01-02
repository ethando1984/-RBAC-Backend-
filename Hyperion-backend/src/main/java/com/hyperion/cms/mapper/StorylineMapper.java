package com.hyperion.cms.mapper;

import com.hyperion.cms.model.Storyline;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface StorylineMapper {

        @Select("SELECT s.*, (SELECT COUNT(*) FROM article_storylines WHERE storyline_id = s.id) as articleCount FROM storylines s WHERE s.id = #{id}")
        @Results({
                        @Result(property = "id", column = "id"),
                        @Result(property = "contentsJson", column = "contents_json"),
                        @Result(property = "layoutJson", column = "layout_json"),
                        @Result(property = "seoTitle", column = "seo_title"),
                        @Result(property = "seoDescription", column = "seo_description"),
                        @Result(property = "createdByUserId", column = "created_by_user_id"),
                        @Result(property = "createdByEmail", column = "created_by_email"),
                        @Result(property = "createdAt", column = "created_at"),
                        @Result(property = "updatedAt", column = "updated_at")
        })
        Storyline findById(@Param("id") UUID id);

        @Select("SELECT s.*, (SELECT COUNT(*) FROM article_storylines WHERE storyline_id = s.id) as articleCount FROM storylines s WHERE s.slug = #{slug}")
        @Results({
                        @Result(property = "id", column = "id"),
                        @Result(property = "contentsJson", column = "contents_json"),
                        @Result(property = "layoutJson", column = "layout_json"),
                        @Result(property = "seoTitle", column = "seo_title"),
                        @Result(property = "seoDescription", column = "seo_description"),
                        @Result(property = "createdByUserId", column = "created_by_user_id"),
                        @Result(property = "createdByEmail", column = "created_by_email"),
                        @Result(property = "createdAt", column = "created_at"),
                        @Result(property = "updatedAt", column = "updated_at")
        })
        Storyline findBySlug(@Param("slug") String slug);

        @Select("<script>" +
                        "SELECT s.*, (SELECT COUNT(*) FROM article_storylines WHERE storyline_id = s.id) as articleCount FROM storylines s "
                        +
                        "<where>" +
                        "<if test='search != null and search != \"\"'> AND (LOWER(s.title) LIKE LOWER(CONCAT('%', #{search}, '%')))</if>"
                        +
                        "</where>" +
                        "ORDER BY s.updated_at DESC " +
                        "LIMIT #{limit} OFFSET #{offset}" +
                        "</script>")
        @Results({
                        @Result(property = "id", column = "id"),
                        @Result(property = "contentsJson", column = "contents_json"),
                        @Result(property = "layoutJson", column = "layout_json"),
                        @Result(property = "seoTitle", column = "seo_title"),
                        @Result(property = "seoDescription", column = "seo_description"),
                        @Result(property = "createdByUserId", column = "created_by_user_id"),
                        @Result(property = "createdByEmail", column = "created_by_email"),
                        @Result(property = "createdAt", column = "created_at"),
                        @Result(property = "updatedAt", column = "updated_at")
        })
        List<Storyline> findAll(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);

        @Insert("INSERT INTO storylines (id, title, slug, description, status, contents_json, layout_json, seo_title, seo_description, created_by_user_id, created_by_email, created_at, updated_at) "
                        +
                        "VALUES (#{id}, #{title}, #{slug}, #{description}, #{status}, #{contentsJson}, #{layoutJson}, #{seoTitle}, #{seoDescription}, #{createdByUserId}, #{createdByEmail}, #{createdAt}, #{updatedAt})")
        void insert(Storyline storyline);

        @Update("UPDATE storylines SET title=#{title}, slug=#{slug}, description=#{description}, status=#{status}, " +
                        "contents_json=#{contentsJson}, layout_json=#{layoutJson}, seo_title=#{seoTitle}, seo_description=#{seoDescription}, "
                        +
                        "updated_at=#{updatedAt} WHERE id=#{id}")
        void update(Storyline storyline);

        @Update("UPDATE storylines SET contents_json=#{contentsJson}, updated_at=#{updatedAt} WHERE id=#{id}")
        void updateContents(@Param("id") UUID id, @Param("contentsJson") String contentsJson,
                        @Param("updatedAt") java.time.LocalDateTime updatedAt);

        @Update("UPDATE storylines SET layout_json=#{layoutJson}, updated_at=#{updatedAt} WHERE id=#{id}")
        void updateLayout(@Param("id") UUID id, @Param("layoutJson") String layoutJson,
                        @Param("updatedAt") java.time.LocalDateTime updatedAt);

        @Delete("DELETE FROM storylines WHERE id = #{id}")
        void delete(@Param("id") UUID id);

        @Insert("INSERT INTO article_storylines (article_id, storyline_id, position) VALUES (#{articleId}, #{storylineId}, #{position})")
        void addArticle(@Param("articleId") UUID articleId, @Param("storylineId") UUID storylineId,
                        @Param("position") int position);

        @Delete("DELETE FROM article_storylines WHERE storyline_id = #{storylineId}")
        void removeAllArticles(@Param("storylineId") UUID storylineId);

        @Select("SELECT article_id FROM article_storylines WHERE storyline_id = #{storylineId} ORDER BY position ASC")
        List<UUID> findArticleIdsByStorylineId(@Param("storylineId") UUID storylineId);

        // Media relations
        @Insert("INSERT INTO storyline_media (storyline_id, media_id, role, sort_order) VALUES (#{storylineId}, #{mediaId}, #{role}, #{sortOrder})")
        void addMedia(@Param("storylineId") UUID storylineId, @Param("mediaId") UUID mediaId,
                        @Param("role") String role, @Param("sortOrder") int sortOrder);

        @Delete("DELETE FROM storyline_media WHERE storyline_id = #{storylineId} AND media_id = #{mediaId}")
        void removeMedia(@Param("storylineId") UUID storylineId, @Param("mediaId") UUID mediaId);

        @Delete("DELETE FROM storyline_media WHERE storyline_id = #{storylineId}")
        void removeAllMedia(@Param("storylineId") UUID storylineId);

        @Select("SELECT sm.*, m.url as mediaUrl, m.type as mediaType FROM storyline_media sm " +
                        "JOIN media_assets m ON sm.media_id = m.id " +
                        "WHERE sm.storyline_id = #{storylineId} ORDER BY sm.sort_order ASC")
        List<Storyline.StorylineMedia> findMediaByStorylineId(@Param("storylineId") UUID storylineId);
}
