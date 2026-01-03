package com.hyperion.cms.royalty.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyperion.cms.mapper.ArticleMapper;
import com.hyperion.cms.model.Article;
import com.hyperion.cms.royalty.dto.OverrideRequest;
import com.hyperion.cms.royalty.dto.RoyaltyRuleSetRequest;
import com.hyperion.cms.royalty.mapper.RoyaltyRecordMapper;
import com.hyperion.cms.royalty.mapper.RoyaltyRuleMapper;
import com.hyperion.cms.royalty.model.*;
import com.hyperion.cms.security.PermissionService;
import com.hyperion.cms.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoyaltyService {

    private final RoyaltyRecordMapper recordMapper;
    private final RoyaltyRuleMapper ruleMapper;
    private final ArticleMapper articleMapper;
    private final com.hyperion.cms.mapper.CategoryMapper categoryMapper;
    private final PermissionService permissionService;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    // ==================================================================================
    // 1. Calculation Logic
    // ==================================================================================

    @Transactional
    public void calculateRoyaltyForArticle(String articleId) {
        log.info("Starting royalty calculation for article {}", articleId);

        // 0. Check for existing records
        List<RoyaltyRecord> existingRecords = recordMapper.findByArticleId(articleId);

        // If already PAID, never update or touch it again
        if (existingRecords.stream().anyMatch(r -> "PAID".equals(r.getStatus()))) {
            log.info("Article {} has already been PAID. Skipping re-calculation.", articleId);
            return;
        }

        // If not PAID, void any other active records to re-start the workflow ("begin")
        for (RoyaltyRecord r : existingRecords) {
            if (!"VOIDED".equals(r.getStatus()) && !"REJECTED".equals(r.getStatus())) {
                transitionStatus(r.getId(), r.getStatus(), "VOIDED", "SYSTEM", "system@hyperion",
                        "Article updated before payment - re-calculating", "VOIDED");
            }
        }

        Article article = articleMapper.findById(UUID.fromString(articleId));
        if (article == null || article.getStatus() != Article.ArticleStatus.PUBLISHED) {
            log.warn("Article {} not found or not published. Skipping.", articleId);
            return;
        }

        // 1. Find active ruleset
        RoyaltyRuleSet ruleSet = ruleMapper.findActiveRuleSet();
        if (ruleSet == null) {
            log.error("No active Royalty RuleSet found. Cannot calculate.");
            return;
        }

        // 2. Gather inputs
        int wordCount = countWords(article.getContentHtml());
        String articleType = determineArticleType(article, wordCount);
        List<String> tags = article.getTagNames() != null ? article.getTagNames() : new ArrayList<>();

        // 3. Base Amount
        List<RoyaltyArticleTypeRate> rates = ruleMapper.findRatesByRuleSetId(ruleSet.getId());
        BigDecimal baseAmount = rates.stream()
                .filter(r -> r.getArticleType().equalsIgnoreCase(articleType))
                .findFirst()
                .map(RoyaltyArticleTypeRate::getBaseAmount)
                .orElse(BigDecimal.ZERO);

        // 4. Multipliers
        List<RoyaltyMultiplier> multipliers = ruleMapper.findMultipliersByRuleSetId(ruleSet.getId());
        BigDecimal multiplierFactor = BigDecimal.ONE;
        Map<String, BigDecimal> appliedMultipliers = new HashMap<>();

        for (RoyaltyMultiplier m : multipliers) {
            boolean applies = false;
            if ("EXCLUSIVE".equalsIgnoreCase(m.getMultiplierType()) && isExclusive(tags))
                applies = true;
            if ("BREAKING".equalsIgnoreCase(m.getMultiplierType()) && isBreaking(tags))
                applies = true;
            if ("HOLIDAY".equalsIgnoreCase(m.getMultiplierType()) && isHoliday(article.getPublishedAt()))
                applies = true;
            if ("OUT_OF_HOURS".equalsIgnoreCase(m.getMultiplierType()) && isOutOfHours(article.getPublishedAt()))
                applies = true;

            if (applies) {
                multiplierFactor = multiplierFactor.multiply(m.getFactor());
                appliedMultipliers.put(m.getKeyName(), m.getFactor());
            }
        }

        // 5. Media Fees
        List<RoyaltyMediaFee> fees = ruleMapper.findMediaFeesByRuleSetId(ruleSet.getId());
        BigDecimal mediaFeeTotal = BigDecimal.ZERO;
        Map<String, Object> mediaBreakdown = new HashMap<>();

        int imageCount = countImages(article.getContentHtml());
        int videoCount = countVideos(article.getContentHtml());

        for (RoyaltyMediaFee fee : fees) {
            BigDecimal feeCalc = BigDecimal.ZERO;
            int count = "IMAGE".equalsIgnoreCase(fee.getMediaType()) ? imageCount : videoCount;

            if (count > 0) {
                if ("FLAT".equalsIgnoreCase(fee.getFeeMode())) {
                    feeCalc = fee.getFeeAmount();
                } else {
                    feeCalc = fee.getFeeAmount().multiply(BigDecimal.valueOf(count));
                }

                if (fee.getMaxFeeAmount() != null && feeCalc.compareTo(fee.getMaxFeeAmount()) > 0) {
                    feeCalc = fee.getMaxFeeAmount();
                }
                mediaFeeTotal = mediaFeeTotal.add(feeCalc);
                mediaBreakdown.put(fee.getMediaType(), Map.of("count", count, "amount", feeCalc));
            }
        }

        // 6. Total
        BigDecimal grossAmount = baseAmount.multiply(multiplierFactor).add(mediaFeeTotal);

        // 7. Metadata (Author, Category)
        String categoryName = "Standard";
        if (article.getPrimaryCategoryId() != null) {
            com.hyperion.cms.model.Category cat = categoryMapper.findById(article.getPrimaryCategoryId());
            if (cat != null) {
                categoryName = cat.getName();
            }
        }

        // 8. Save Record
        RoyaltyRecord record = RoyaltyRecord.builder()
                .id(UUID.randomUUID().toString())
                .articleId(article.getId().toString())
                .articleSlug(article.getSlug())
                .articleTitle(article.getTitle())
                .categoryId(article.getPrimaryCategoryId() != null ? article.getPrimaryCategoryId().toString() : null)
                .categoryName(categoryName)
                .articleType(articleType)
                .wordCount(wordCount)
                .authorId(article.getAuthorUserId())
                .authorDisplayName(article.getCreatedByEmail()) // Fallback to email if display name not in Article
                .authorEmail(article.getCreatedByEmail())
                .authorType("INTERNAL")
                .publishedAt(article.getPublishedAt())
                .status("CALCULATED")
                .baseAmount(baseAmount)
                .multiplierFactor(multiplierFactor)
                .mediaFeeTotal(mediaFeeTotal)
                .grossAmount(grossAmount)
                .finalAmount(grossAmount)
                .createdAt(LocalDateTime.now())
                .build();

        // Snapshot
        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("ruleSetId", ruleSet.getId());
        snapshot.put("ruleSetName", ruleSet.getName());
        snapshot.put("inputs", Map.of("wordCount", wordCount, "tags", tags, "publishedAt", article.getPublishedAt()));
        snapshot.put("appliedMultipliers", appliedMultipliers);
        snapshot.put("mediaBreakdown", mediaBreakdown);

        try {
            record.setCalcSnapshotJson(objectMapper.writeValueAsString(snapshot));
        } catch (Exception e) {
            record.setCalcSnapshotJson("{}");
        }

        recordMapper.insert(record);
        auditService.log("AUTO_CALCULATED", "ROYALTY_RECORD", record.getId(), null, record);
    }

    @Transactional
    public int bulkCalculateRoyalty() {
        permissionService.requirePermission("royalties", "calculate");
        List<Article> articles = articleMapper.findAll("PUBLISHED", null, null, null, null, null, 1000, 0);
        int count = 0;
        for (Article art : articles) {
            calculateRoyaltyForArticle(art.getId().toString());
            count++;
        }
        return count;
    }

    private int countWords(String html) {
        if (html == null || html.isEmpty())
            return 0;
        String text = html.replaceAll("<[^>]*>", " ");
        String[] words = text.trim().split("\\s+");
        return words.length;
    }

    private int countImages(String html) {
        if (html == null)
            return 0;
        Matcher m = Pattern.compile("<img\\s+[^>]*src=[\"']([^\"']+)[\"'][^>]*>").matcher(html);
        int count = 0;
        while (m.find())
            count++;
        return count;
    }

    private int countVideos(String html) {
        if (html == null)
            return 0;
        Matcher m = Pattern.compile("<video[^>]*>").matcher(html);
        int count = 0;
        while (m.find())
            count++;
        return count;
    }

    private String determineArticleType(Article article, int wordCount) {
        List<String> tags = article.getTagNames() != null ? article.getTagNames() : Collections.emptyList();
        if (tags.stream().anyMatch(t -> t.equalsIgnoreCase("Investigation")))
            return "INVESTIGATION";
        if (tags.stream().anyMatch(t -> t.equalsIgnoreCase("Reportage")))
            return "REPORTAGE";
        if (tags.stream().anyMatch(t -> t.equalsIgnoreCase("Analysis")))
            return "ANALYSIS";
        if (wordCount < 500)
            return "SHORT_NEWS";
        return "NEWS";
    }

    private boolean isExclusive(List<String> tags) {
        return tags.stream().anyMatch(t -> t.equalsIgnoreCase("Exclusive"));
    }

    private boolean isBreaking(List<String> tags) {
        return tags.stream().anyMatch(t -> t.equalsIgnoreCase("Breaking"));
    }

    private boolean isHoliday(LocalDateTime date) {
        // Simple logic for example
        return date.getMonthValue() == 1 && date.getDayOfMonth() == 1;
    }

    private boolean isOutOfHours(LocalDateTime date) {
        int hour = date.getHour();
        return hour < 6 || hour > 19;
    }

    // ==================================================================================
    // 2. Workflow Actions
    // ==================================================================================

    @Transactional
    public void confirmByEditor(String recordId, String userId, String email) {
        permissionService.requirePermission("royalties", "editor_confirm");
        transitionStatus(recordId, "CALCULATED", "EDITOR_CONFIRMED", userId, email, null, "EDITOR_CONFIRMED");
    }

    @Transactional
    public void approveByManager(String recordId, String userId, String email) {
        permissionService.requirePermission("royalties", "manager_approve");
        transitionStatus(recordId, "EDITOR_CONFIRMED", "MANAGER_APPROVED", userId, email, null, "MANAGER_APPROVED");
    }

    @Transactional
    public void approveByFinance(String recordId, String userId, String email) {
        permissionService.requirePermission("royalties", "finance_approve");
        transitionStatus(recordId, "MANAGER_APPROVED", "FINANCE_APPROVED", userId, email, null, "FINANCE_APPROVED");
    }

    @Transactional
    public void markPaid(String recordId, String paymentRef, LocalDateTime paidAt, String userId, String email) {
        permissionService.requirePermission("royalties", "mark_paid");
        transitionStatus(recordId, "FINANCE_APPROVED", "PAID", userId, email, "Payment Ref: " + paymentRef,
                "MARK_PAID");
        // Could update paidAt if entity had it, currently just status update + log
    }

    @Transactional
    public void reject(String recordId, String reason, String userId, String email) {
        // Any role with permission can reject? Or specific? Assuming generic royalty
        // permission
        RoyaltyRecord r = recordMapper.findById(recordId);
        if (r == null)
            throw new IllegalArgumentException("Record not found");
        transitionStatus(recordId, r.getStatus(), "REJECTED", userId, email, reason, "REJECT");
    }

    private void transitionStatus(String recordId, String fromStatus, String toStatus, String userId, String email,
            String note, String actionType) {
        RoyaltyRecord r = recordMapper.findById(recordId);
        if (r == null)
            throw new IllegalArgumentException("Record not found");
        if (!r.getStatus().equals(fromStatus) && !fromStatus.equals("*")) {
            throw new IllegalStateException("Invalid status transition from " + r.getStatus() + " to " + toStatus);
        }

        String oldStatus = r.getStatus();
        r.setStatus(toStatus);
        r.setUpdatedAt(LocalDateTime.now());
        r.setUpdatedByUserId(userId);
        r.setUpdatedByEmail(email);
        recordMapper.update(r);

        RoyaltyApprovalHistory history = RoyaltyApprovalHistory.builder()
                .id(UUID.randomUUID().toString())
                .royaltyRecordId(recordId)
                .actionType(actionType)
                .actorUserId(userId)
                .actorEmail(email)
                .oldStatus(oldStatus)
                .newStatus(toStatus)
                .oldAmount(r.getFinalAmount())
                .newAmount(r.getFinalAmount())
                .reasonNote(note)
                .createdAt(LocalDateTime.now())
                .build();
        recordMapper.insertHistory(history);
    }

    // ==================================================================================
    // 3. Overrides
    // ==================================================================================

    @Transactional
    public void overrideAmount(String recordId, OverrideRequest req, String userId, String email) {
        RoyaltyRecord r = recordMapper.findById(recordId);
        if (r == null)
            throw new IllegalArgumentException("Record not found");

        // Check limits based on role (Mocking role check logic or use RuleSet policy)
        // Assume user role is checked via SecurityContext or passed in
        // For now, allow but log. In real impl, check Policy vs Role.

        BigDecimal diff = req.getFinalAmount().subtract(r.getGrossAmount());
        BigDecimal oldAmt = r.getFinalAmount();

        r.setOverrideAmount(diff);
        r.setFinalAmount(req.getFinalAmount());
        r.setNote(req.getNote());
        r.setUpdatedAt(LocalDateTime.now());
        r.setUpdatedByUserId(userId);
        r.setUpdatedByEmail(email);

        recordMapper.update(r);

        RoyaltyApprovalHistory history = RoyaltyApprovalHistory.builder()
                .id(UUID.randomUUID().toString())
                .royaltyRecordId(recordId)
                .actionType("OVERRIDE_AMOUNT")
                .actorUserId(userId)
                .actorEmail(email)
                .oldStatus(r.getStatus())
                .newStatus(r.getStatus())
                .oldAmount(oldAmt)
                .newAmount(req.getFinalAmount())
                .reasonNote(req.getNote())
                .createdAt(LocalDateTime.now())
                .build();
        recordMapper.insertHistory(history);
    }

    // ==================================================================================
    // 4. Batch Logic
    // ==================================================================================

    @Transactional
    public RoyaltyPaymentBatch createBatch(String monthKey, String userId, String email) {
        if (recordMapper.findBatchByMonth(monthKey) != null) {
            throw new IllegalStateException("Batch already exists for " + monthKey);
        }

        // Find all FINANCE_APPROVED records for this month
        // Ideally mapper needs selectByMonthAndStatus
        List<RoyaltyRecord> records = recordMapper.findRecords(null, "FINANCE_APPROVED", monthKey, 1000, 0);

        BigDecimal total = records.stream().map(RoyaltyRecord::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        RoyaltyPaymentBatch batch = RoyaltyPaymentBatch.builder()
                .id(UUID.randomUUID().toString())
                .monthKey(monthKey)
                .status("DRAFT")
                .totalItems(records.size())
                .totalAmount(total)
                .createdAt(LocalDateTime.now())
                .createdByUserId(userId)
                .createdByEmail(email)
                .build();

        recordMapper.insertBatch(batch);

        for (RoyaltyRecord rec : records) {
            RoyaltyPaymentBatchItem item = RoyaltyPaymentBatchItem.builder()
                    .batchId(batch.getId())
                    .royaltyRecordId(rec.getId())
                    .authorId(rec.getAuthorId())
                    .authorEmail(rec.getAuthorEmail())
                    .amount(rec.getFinalAmount())
                    .build();
            recordMapper.insertBatchItem(item);
        }
        return batch;
    }

    // Rule Set Management Wrappers
    @Transactional
    public RoyaltyRuleSet createRuleSet(RoyaltyRuleSetRequest req, String userId, String email) {
        permissionService.requirePermission("royalties", "rules_manage");
        RoyaltyRuleSet rules = RoyaltyRuleSet.builder()
                .id(UUID.randomUUID().toString())
                .name(req.getName())
                .status("INACTIVE")
                .currency(req.getCurrency())
                .effectiveFrom(req.getEffectiveFrom())
                .effectiveTo(req.getEffectiveTo())
                .createdAt(LocalDateTime.now())
                .createdByUserId(userId)
                .createdByEmail(email)
                .build();
        ruleMapper.insertRuleSet(rules);

        if (req.getRates() != null) {
            req.getRates().forEach(r -> ruleMapper.insertRate(RoyaltyArticleTypeRate.builder()
                    .id(UUID.randomUUID().toString())
                    .ruleSetId(rules.getId())
                    .baseAmount(r.getBaseAmount())
                    .articleType(r.getArticleType())
                    .build()));
        }

        if (req.getMultipliers() != null) {
            req.getMultipliers().forEach(m -> ruleMapper.insertMultiplier(RoyaltyMultiplier.builder()
                    .id(UUID.randomUUID().toString())
                    .ruleSetId(rules.getId())
                    .multiplierType(m.getMultiplierType())
                    .keyName(m.getKeyName())
                    .factor(m.getFactor())
                    .build()));
        }

        if (req.getMediaFees() != null) {
            req.getMediaFees().forEach(f -> ruleMapper.insertMediaFee(RoyaltyMediaFee.builder()
                    .id(UUID.randomUUID().toString())
                    .ruleSetId(rules.getId())
                    .mediaType(f.getMediaType())
                    .feeAmount(f.getFeeAmount())
                    .feeMode(f.getFeeMode())
                    .maxFeeAmount(f.getMaxFeeAmount())
                    .build()));
        }

        if (req.getPolicy() != null) {
            ruleMapper.insertPolicy(RoyaltyOverridePolicy.builder()
                    .id(UUID.randomUUID().toString())
                    .ruleSetId(rules.getId())
                    .editorOverrideMaxPercent(req.getPolicy().getEditorOverrideMaxPercent())
                    .managerOverrideMaxPercent(req.getPolicy().getManagerOverrideMaxPercent())
                    .requireNoteForOverride(req.getPolicy().isRequireNoteForOverride())
                    .allowManualBaseRateOverride(req.getPolicy().isAllowManualBaseRateOverride())
                    .build());
        }

        return rules;
    }

    public List<RoyaltyRuleSet> getAllRuleSets() {
        return ruleMapper.findAllRuleSets();
    }

    public RoyaltyRuleSet getRuleSet(String id) {
        return ruleMapper.findRuleSetById(id);
    }

    public RoyaltyRuleSet activateRuleSet(String id) {
        permissionService.requirePermission("royalties", "rules_manage");
        RoyaltyRuleSet r = ruleMapper.findRuleSetById(id);
        r.setStatus("ACTIVE");
        ruleMapper.updateRuleSet(r);
        return r;
    }

    public List<RoyaltyRecord> getRecords(String authorId, String status, String month, int page, int size) {
        int offset = (page - 1) * size;
        return recordMapper.findRecords(authorId, status, month, size, offset);
    }

    public RoyaltyRecord getRecord(String id) {
        return recordMapper.findById(id);
    }

    public List<RoyaltyApprovalHistory> getRecordHistory(String id) {
        return recordMapper.findHistoryByRecordId(id);
    }

    @Transactional
    public void voidRoyaltyForArticle(String articleId) {
        List<RoyaltyRecord> records = recordMapper.findByArticleId(articleId);
        for (RoyaltyRecord r : records) {
            if ("PAID".equals(r.getStatus())) {
                log.info("Skipping void for record {} as it is already PAID", r.getId());
                continue;
            }
            if ("REJECTED".equals(r.getStatus())) {
                log.info("Skipping void for record {} as it is already REJECTED", r.getId());
                continue;
            }
            // Only void if not already VOIDED
            if (!"VOIDED".equals(r.getStatus())) {
                transitionStatus(r.getId(), r.getStatus(), "VOIDED", "SYSTEM", "system@hyperion",
                        "Article content modified or unpublished", "VOIDED");
            }
        }
    }

    public String exportBatchToCsv(String batchId) {
        RoyaltyPaymentBatch batch = recordMapper.findBatchById(batchId);
        if (batch == null)
            throw new IllegalArgumentException("Batch not found");

        List<RoyaltyPaymentBatchItem> items = recordMapper.findBatchItems(batchId);
        StringBuilder csv = new StringBuilder("BatchID,Month,AuthorID,Email,Amount\n");
        for (RoyaltyPaymentBatchItem item : items) {
            csv.append(batch.getId()).append(",")
                    .append(batch.getMonthKey()).append(",")
                    .append(item.getAuthorId()).append(",")
                    .append(item.getAuthorEmail()).append(",")
                    .append(item.getAmount()).append("\n");
        }
        return csv.toString();
    }
}
