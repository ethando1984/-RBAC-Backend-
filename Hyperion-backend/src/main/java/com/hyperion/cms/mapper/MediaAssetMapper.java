package com.hyperion.cms.mapper;

import com.hyperion.cms.model.MediaAsset;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface MediaAssetMapper {

    @Select("SELECT * FROM media_assets WHERE id = #{id}")
    MediaAsset findById(UUID id);

    @Select("SELECT * FROM media_assets ORDER BY created_at DESC")
    List<MediaAsset> findAll();

    @Insert("INSERT INTO media_assets (id, type, filename, mime_type, size_bytes, storage_key, url, width, height, duration_sec, thumbnail_key, created_by_user_id, created_by_email, created_at) "
            +
            "VALUES (#{id}, #{type}, #{filename}, #{mimeType}, #{sizeBytes}, #{storageKey}, #{url}, #{width}, #{height}, #{durationSec}, #{thumbnailKey}, #{createdByUserId}, #{createdByEmail}, #{createdAt})")
    void insert(MediaAsset asset);

    @Delete("DELETE FROM media_assets WHERE id = #{id}")
    void delete(UUID id);
}
