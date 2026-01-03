package com.hyperion.cms.mapper;

import com.hyperion.cms.model.ArticleVersion;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ArticleVersionMapper {

    @Select("SELECT * FROM article_versions WHERE article_id = #{articleId} ORDER BY version_number DESC")
    List<ArticleVersion> findByArticleId(UUID articleId);

    @Select("SELECT * FROM article_versions WHERE id = #{id}")
    ArticleVersion findById(UUID id);

    @Select("SELECT COALESCE(MAX(version_number), 0) FROM article_versions WHERE article_id = #{articleId}")
    int getMaxVersionNumber(UUID articleId);

    @Insert("INSERT INTO article_versions (id, article_id, version_number, snapshot_json, diff_summary, status_at_that_time, edited_by_user_id, edited_by_email, edited_at) "
            +
            "VALUES (#{id}, #{articleId}, #{versionNumber}, #{snapshotJson}, #{diffSummary}, #{statusAtThatTime}, #{editedByUserId}, #{editedByEmail}, #{editedAt})")
    void insert(ArticleVersion version);
}
