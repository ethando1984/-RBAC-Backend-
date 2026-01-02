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
}
