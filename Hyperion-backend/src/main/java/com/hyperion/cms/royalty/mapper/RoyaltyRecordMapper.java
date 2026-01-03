package com.hyperion.cms.royalty.mapper;

import com.hyperion.cms.royalty.model.*;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface RoyaltyRecordMapper {

        // Records
        @Select("SELECT * FROM royalty_records WHERE id = #{id}")
        RoyaltyRecord findById(String id);

        @Select("SELECT * FROM royalty_records WHERE article_id = #{articleId} ORDER BY created_at DESC")
        List<RoyaltyRecord> findByArticleId(String articleId);

        @Select("<script>" +
                        "SELECT * FROM (" +
                        "  SELECT *, ROW_NUMBER() OVER(PARTITION BY article_id ORDER BY created_at DESC) as rn " +
                        "  FROM royalty_records WHERE 1=1 " +
                        "  <if test='authorId != null'> AND author_id = #{authorId} </if>" +
                        "  <if test='status != null'> AND status = #{status} </if>" +
                        "  <if test='month != null'> AND to_char(published_at, 'YYYY-MM') = #{month} </if>" +
                        ") WHERE rn = 1 " +
                        "ORDER BY published_at DESC LIMIT #{limit} OFFSET #{offset}" +
                        "</script>")
        List<RoyaltyRecord> findRecords(@Param("authorId") String authorId,
                        @Param("status") String status,
                        @Param("month") String month,
                        @Param("limit") int limit,
                        @Param("offset") int offset);

        @Insert("INSERT INTO royalty_records (id, article_id, article_slug, article_title, category_id, category_name, article_type, word_count, author_id, author_display_name, author_email, author_type, author_level, published_at, status, calc_snapshot_json, base_amount, multiplier_factor, media_fee_total, bonus_amount, gross_amount, override_amount, final_amount, note, created_at, created_by_user_id, created_by_email, updated_at, updated_by_user_id, updated_by_email) "
                        +
                        "VALUES (#{id}, #{articleId}, #{articleSlug}, #{articleTitle}, #{categoryId}, #{categoryName}, #{articleType}, #{wordCount}, #{authorId}, #{authorDisplayName}, #{authorEmail}, #{authorType}, #{authorLevel}, #{publishedAt}, #{status}, #{calcSnapshotJson}, #{baseAmount}, #{multiplierFactor}, #{mediaFeeTotal}, #{bonusAmount}, #{grossAmount}, #{overrideAmount}, #{finalAmount}, #{note}, #{createdAt}, #{createdByUserId}, #{createdByEmail}, #{updatedAt}, #{updatedByUserId}, #{updatedByEmail})")
        void insert(RoyaltyRecord record);

        @Update("UPDATE royalty_records SET status=#{status}, override_amount=#{overrideAmount}, final_amount=#{finalAmount}, note=#{note}, updated_at=#{updatedAt}, updated_by_user_id=#{updatedByUserId}, updated_by_email=#{updatedByEmail} WHERE id=#{id}")
        void update(RoyaltyRecord record);

        // Approval History
        @Select("SELECT * FROM royalty_approval_histories WHERE royalty_record_id = #{recordId} ORDER BY created_at DESC")
        List<RoyaltyApprovalHistory> findHistoryByRecordId(String recordId);

        @Insert("INSERT INTO royalty_approval_histories (id, royalty_record_id, action_type, actor_user_id, actor_email, old_status, new_status, old_amount, new_amount, reason_note, created_at, correlation_id, ip_address) "
                        +
                        "VALUES (#{id}, #{royaltyRecordId}, #{actionType}, #{actorUserId}, #{actorEmail}, #{oldStatus}, #{newStatus}, #{oldAmount}, #{newAmount}, #{reasonNote}, #{createdAt}, #{correlationId}, #{ipAddress})")
        void insertHistory(RoyaltyApprovalHistory history);

        // Batches
        @Select("SELECT * FROM royalty_payment_batches WHERE month_key = #{monthKey}")
        RoyaltyPaymentBatch findBatchByMonth(String monthKey);

        @Select("SELECT * FROM royalty_payment_batches WHERE id = #{id}")
        RoyaltyPaymentBatch findBatchById(String id);

        @Insert("INSERT INTO royalty_payment_batches (id, month_key, status, total_items, total_amount, created_at, created_by_user_id, created_by_email) "
                        +
                        "VALUES (#{id}, #{monthKey}, #{status}, #{totalItems}, #{totalAmount}, #{createdAt}, #{createdByUserId}, #{createdByEmail})")
        void insertBatch(RoyaltyPaymentBatch batch);

        @Update("UPDATE royalty_payment_batches SET status=#{status}, approved_at=#{approvedAt}, approved_by_user_id=#{approvedByUserId}, approved_by_email=#{approvedByEmail}, paid_at=#{paidAt}, paid_by_user_id=#{paidByUserId}, payment_ref=#{paymentRef}, export_file_key=#{exportFileKey} WHERE id=#{id}")
        void updateBatch(RoyaltyPaymentBatch batch);

        // Batch Items
        @Insert("INSERT INTO royalty_payment_batch_items (batch_id, royalty_record_id, author_id, author_email, amount) VALUES (#{batchId}, #{royaltyRecordId}, #{authorId}, #{authorEmail}, #{amount})")
        void insertBatchItem(RoyaltyPaymentBatchItem item);

        @Select("SELECT * FROM royalty_payment_batch_items WHERE batch_id = #{batchId}")
        List<RoyaltyPaymentBatchItem> findBatchItems(String batchId);
}
