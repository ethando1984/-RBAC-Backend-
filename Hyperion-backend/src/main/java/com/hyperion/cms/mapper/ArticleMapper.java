package com.hyperion.cms.mapper;

import com.hyperion.cms.model.Article;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface ArticleMapper {

        @Select("SELECT * FROM articles WHERE id = #{id}")
        Article findById(@Param("id") UUID id);

        @Select("SELECT * FROM articles WHERE slug = #{slug}")
        Article findBySlug(String slug);

        @Select("<script>" +
                        "SELECT * FROM articles " +
                        "<where>" +
                        "  <if test='status != null and status != \"\"'>AND status = #{status}</if>" +
                        "  <if test='search != null and search != \"\"'>AND (LOWER(title) LIKE LOWER(CONCAT('%', #{search}, '%')))</if>"
                        +
                        "</where>" +
                        "ORDER BY created_at DESC " +
                        "LIMIT #{limit} OFFSET #{offset}" +
                        "</script>")
        List<Article> findAll(@Param("status") String status, @Param("search") String search, @Param("limit") int limit,
                        @Param("offset") int offset);

        @Insert("INSERT INTO articles (id, title, subtitle, slug, content_html, excerpt, cover_media_id, source_name, source_url, "
                        +
                        "seo_title, seo_description, canonical_url, robots, status, visibility, scheduled_at, created_by_user_id, created_by_email, "
                        +
                        "author_user_id, author_role_id, created_at) "
                        +
                        "VALUES (#{id}, #{title}, #{subtitle}, #{slug}, #{contentHtml}, #{excerpt}, #{coverMediaId}, #{sourceName}, #{sourceUrl}, "
                        +
                        "#{seoTitle}, #{seoDescription}, #{canonicalUrl}, #{robots}, #{status}, #{visibility}, #{scheduledAt}, #{createdByUserId}, #{createdByEmail}, "
                        +
                        "#{authorUserId}, #{authorRoleId}, #{createdAt})")
        void insert(Article article);

        @Update("UPDATE articles SET title=#{title}, subtitle=#{subtitle}, content_html=#{contentHtml}, excerpt=#{excerpt}, "
                        +
                        "cover_media_id=#{coverMediaId}, source_name=#{sourceName}, source_url=#{sourceUrl}, " +
                        "seo_title=#{seoTitle}, seo_description=#{seoDescription}, canonical_url=#{canonicalUrl}, robots=#{robots}, "
                        +
                        "status=#{status}, visibility=#{visibility}, scheduled_at=#{scheduledAt}, "
                        +
                        "author_user_id=#{authorUserId}, author_role_id=#{authorRoleId}, "
                        +
                        "updated_by_user_id=#{updatedByUserId}, updated_by_email=#{updatedByEmail}, "
                        +
                        "updated_at=#{updatedAt} WHERE id=#{id}")
        void update(Article article);

        @Insert("INSERT INTO article_categories (article_id, category_id, is_primary) VALUES (#{articleId}, #{categoryId}, #{isPrimary})")
        void addCategory(@Param("articleId") UUID articleId, @Param("categoryId") UUID categoryId,
                        @Param("isPrimary") boolean isPrimary);

        @Delete("DELETE FROM article_categories WHERE article_id = #{articleId}")
        void removeAllCategories(@Param("articleId") UUID articleId);

        @Select("SELECT category_id FROM article_categories WHERE article_id = #{articleId}")
        List<UUID> findCategoryIdsByArticleId(@Param("articleId") UUID articleId);

        @Select("SELECT category_id FROM article_categories WHERE article_id = #{articleId} AND is_primary = true")
        UUID findPrimaryCategoryIdByArticleId(@Param("articleId") UUID articleId);
}
