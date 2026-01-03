package com.hyperion.cms.royalty.mapper;

import com.hyperion.cms.royalty.model.*;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface RoyaltyRuleMapper {

    // RuleSets
    @Select("SELECT * FROM royalty_rule_sets WHERE status = 'ACTIVE' AND effective_from <= CURRENT_TIMESTAMP AND (effective_to IS NULL OR effective_to >= CURRENT_TIMESTAMP) ORDER BY created_at DESC LIMIT 1")
    RoyaltyRuleSet findActiveRuleSet();

    @Select("SELECT * FROM royalty_rule_sets WHERE id = #{id}")
    RoyaltyRuleSet findRuleSetById(String id);

    @Select("SELECT * FROM royalty_rule_sets ORDER BY created_at DESC")
    List<RoyaltyRuleSet> findAllRuleSets();

    @Insert("INSERT INTO royalty_rule_sets (id, name, status, currency, effective_from, effective_to, created_at, created_by_user_id, created_by_email, updated_at, updated_by_user_id, updated_by_email) "
            +
            "VALUES (#{id}, #{name}, #{status}, #{currency}, #{effectiveFrom}, #{effectiveTo}, #{createdAt}, #{createdByUserId}, #{createdByEmail}, #{updatedAt}, #{updatedByUserId}, #{updatedByEmail})")
    void insertRuleSet(RoyaltyRuleSet ruleSet);

    @Update("UPDATE royalty_rule_sets SET name=#{name}, status=#{status}, currency=#{currency}, effective_from=#{effectiveFrom}, effective_to=#{effectiveTo}, updated_at=#{updatedAt}, updated_by_user_id=#{updatedByUserId}, updated_by_email=#{updatedByEmail} WHERE id=#{id}")
    void updateRuleSet(RoyaltyRuleSet ruleSet);

    // Rates
    @Select("SELECT * FROM royalty_article_type_rates WHERE rule_set_id = #{ruleSetId}")
    List<RoyaltyArticleTypeRate> findRatesByRuleSetId(String ruleSetId);

    @Insert("INSERT INTO royalty_article_type_rates (id, rule_set_id, article_type, base_amount) VALUES (#{id}, #{ruleSetId}, #{articleType}, #{baseAmount})")
    void insertRate(RoyaltyArticleTypeRate rate);

    @Delete("DELETE FROM royalty_article_type_rates WHERE rule_set_id = #{ruleSetId}")
    void deleteRatesByRuleSetId(String ruleSetId);

    // Multipliers
    @Select("SELECT * FROM royalty_multipliers WHERE rule_set_id = #{ruleSetId}")
    List<RoyaltyMultiplier> findMultipliersByRuleSetId(String ruleSetId);

    @Insert("INSERT INTO royalty_multipliers (id, rule_set_id, multiplier_type, key_name, factor) VALUES (#{id}, #{ruleSetId}, #{multiplierType}, #{keyName}, #{factor})")
    void insertMultiplier(RoyaltyMultiplier multiplier);

    @Delete("DELETE FROM royalty_multipliers WHERE rule_set_id = #{ruleSetId}")
    void deleteMultipliersByRuleSetId(String ruleSetId);

    // Media Fees
    @Select("SELECT * FROM royalty_media_fees WHERE rule_set_id = #{ruleSetId}")
    List<RoyaltyMediaFee> findMediaFeesByRuleSetId(String ruleSetId);

    @Insert("INSERT INTO royalty_media_fees (id, rule_set_id, media_type, fee_amount, fee_mode, max_fee_amount) VALUES (#{id}, #{ruleSetId}, #{mediaType}, #{feeAmount}, #{feeMode}, #{maxFeeAmount})")
    void insertMediaFee(RoyaltyMediaFee fee);

    @Delete("DELETE FROM royalty_media_fees WHERE rule_set_id = #{ruleSetId}")
    void deleteMediaFeesByRuleSetId(String ruleSetId);

    // Policy
    @Select("SELECT * FROM royalty_override_policies WHERE rule_set_id = #{ruleSetId}")
    RoyaltyOverridePolicy findPolicyByRuleSetId(String ruleSetId);

    @Insert("INSERT INTO royalty_override_policies (id, rule_set_id, editor_override_max_percent, manager_override_max_percent, require_note_for_override, allow_manual_base_rate_override) "
            +
            "VALUES (#{id}, #{ruleSetId}, #{editorOverrideMaxPercent}, #{managerOverrideMaxPercent}, #{requireNoteForOverride}, #{allowManualBaseRateOverride})")
    void insertPolicy(RoyaltyOverridePolicy policy);

    @Delete("DELETE FROM royalty_override_policies WHERE rule_set_id = #{ruleSetId}")
    void deletePolicyByRuleSetId(String ruleSetId);
}
