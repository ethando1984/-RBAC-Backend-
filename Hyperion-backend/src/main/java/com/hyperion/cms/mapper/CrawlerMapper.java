package com.hyperion.cms.mapper;

import com.hyperion.cms.model.CrawlerSource;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface CrawlerMapper {

        @Select("SELECT * FROM crawler_sources ORDER BY name ASC")
        List<CrawlerSource> findAllSources();

        @Select("SELECT * FROM crawler_sources WHERE id = #{id}")
        CrawlerSource findSourceById(UUID id);

        @Insert("INSERT INTO crawler_sources (id, name, base_url, enabled, extraction_template_json, created_at) " +
                        "VALUES (#{id}, #{name}, #{baseUrl}, #{enabled}, #{extractionTemplateJson}, #{createdAt})")
        void insertSource(CrawlerSource source);

        @Update("UPDATE crawler_sources SET name=#{name}, base_url=#{baseUrl}, enabled=#{enabled}, " +
                        "extraction_template_json=#{extractionTemplateJson} WHERE id=#{id}")
        void updateSource(CrawlerSource source);

        @Delete("DELETE FROM crawler_sources WHERE id = #{id}")
        void deleteSource(UUID id);

        // Jobs
        @Insert("INSERT INTO crawler_jobs (id, source_id, status, started_at, finished_at, created_by_user_id, created_by_email) "
                        +
                        "VALUES (#{id}, #{sourceId}, #{status}, #{startedAt}, #{finishedAt}, #{createdByUserId}, #{createdByEmail})")
        void insertJob(com.hyperion.cms.model.CrawlerJob job);

        @Update("UPDATE crawler_jobs SET status=#{status}, finished_at=#{finishedAt} WHERE id=#{id}")
        void updateJob(com.hyperion.cms.model.CrawlerJob job);

        @Select("SELECT * FROM crawler_jobs WHERE source_id = #{sourceId} ORDER BY started_at DESC")
        List<com.hyperion.cms.model.CrawlerJob> findJobsBySourceId(UUID sourceId);

        @Select("SELECT * FROM crawler_jobs WHERE id = #{id}")
        com.hyperion.cms.model.CrawlerJob findJobById(UUID id);

        // Results
        @Insert("INSERT INTO crawler_results (id, job_id, url, extracted_title, extracted_html, extracted_meta_json, review_status) "
                        +
                        "VALUES (#{id}, #{jobId}, #{url}, #{extractedTitle}, #{extractedHtml}, #{extractedMetaJson}, #{reviewStatus})")
        void insertResult(com.hyperion.cms.model.CrawlerResult result);

        @Select("SELECT * FROM crawler_results WHERE job_id = #{jobId} ORDER BY id ASC")
        List<com.hyperion.cms.model.CrawlerResult> findResultsByJobId(UUID jobId);

        @Select("SELECT * FROM crawler_results WHERE id = #{id}")
        com.hyperion.cms.model.CrawlerResult findResultById(UUID id);

        @Update("UPDATE crawler_results SET review_status=#{reviewStatus}, " +
                        "reviewed_by_user_id=#{reviewedByUserId}, reviewed_by_email=#{reviewedByEmail}, reviewed_at=#{reviewedAt} "
                        +
                        "WHERE id=#{id}")
        void updateResult(com.hyperion.cms.model.CrawlerResult result);
}
