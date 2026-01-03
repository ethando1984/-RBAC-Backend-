package com.hyperion.cms.controller;

import com.hyperion.cms.royalty.dto.*;
import com.hyperion.cms.royalty.model.RoyaltyRecord;
import com.hyperion.cms.royalty.model.RoyaltyRuleSet;
import com.hyperion.cms.royalty.service.RoyaltyService;
import com.hyperion.cms.security.RequirePermission;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/royalty")
@RequiredArgsConstructor
public class RoyaltyController {

    private final RoyaltyService service;

    @GetMapping("/ping")
    public String ping() {
        return "Royalty system is up";
    }

    // Rules
    @GetMapping("/rulesets")
    @RequirePermission(namespace = "royalties", action = "rules_manage")
    public ResponseEntity<List<RoyaltyRuleSet>> listRuleSets() {
        return ResponseEntity.ok(service.getAllRuleSets());
    }

    @PostMapping("/rulesets")
    @RequirePermission(namespace = "royalties", action = "rules_manage")
    public ResponseEntity<RoyaltyRuleSet> createRuleSet(@RequestBody RoyaltyRuleSetRequest request,
            Principal principal) {
        return ResponseEntity.ok(service.createRuleSet(request, principal.getName(), principal.getName()));
    }

    @GetMapping("/rulesets/{id}")
    @RequirePermission(namespace = "royalties", action = "rules_manage")
    public ResponseEntity<RoyaltyRuleSet> getRuleSet(@PathVariable String id) {
        return ResponseEntity.ok(service.getRuleSet(id));
    }

    @PostMapping("/rulesets/{id}/activate")
    @RequirePermission(namespace = "royalties", action = "rules_manage")
    public ResponseEntity<RoyaltyRuleSet> activateRuleSet(@PathVariable String id) {
        return ResponseEntity.ok(service.activateRuleSet(id));
    }

    // Records
    @GetMapping("/records")
    @RequirePermission(namespace = "royalties", action = "read_all")
    public ResponseEntity<List<RoyaltyRecord>> getRecords(
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String month,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getRecords(author, status, month, page, size));
    }

    @GetMapping("/records/{id}")
    @RequirePermission(namespace = "royalties", action = "read_all")
    public ResponseEntity<RoyaltyRecord> getRecord(@PathVariable String id) {
        return ResponseEntity.ok(service.getRecord(id));
    }

    @GetMapping("/records/{id}/history")
    @RequirePermission(namespace = "royalties", action = "read_all")
    public ResponseEntity<List<com.hyperion.cms.royalty.model.RoyaltyApprovalHistory>> getRecordHistory(
            @PathVariable String id) {
        return ResponseEntity.ok(service.getRecordHistory(id));
    }

    @PostMapping("/records/bulk-calculate")
    @RequirePermission(namespace = "royalties", action = "calculate")
    public ResponseEntity<Map<String, Object>> bulkCalculate() {
        int count = service.bulkCalculateRoyalty();
        return ResponseEntity.ok(Map.of("message", "Processed " + count + " articles", "count", count));
    }

    @PostMapping("/records/{id}/calculate") // Manual trigger for testing
    @RequirePermission(namespace = "royalties", action = "rules_manage")
    public ResponseEntity<Void> calculate(@PathVariable String id) {
        service.calculateRoyaltyForArticle(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/records/{id}/editor-confirm")
    @RequirePermission(namespace = "royalties", action = "editor_confirm")
    public ResponseEntity<Void> editorConfirm(@PathVariable String id, Principal principal) {
        service.confirmByEditor(id, principal.getName(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/records/{id}/manager-approve")
    @RequirePermission(namespace = "royalties", action = "manager_approve")
    public ResponseEntity<Void> managerApprove(@PathVariable String id, Principal principal) {
        service.approveByManager(id, principal.getName(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/records/{id}/finance-approve")
    @RequirePermission(namespace = "royalties", action = "finance_approve")
    public ResponseEntity<Void> financeApprove(@PathVariable String id, Principal principal) {
        service.approveByFinance(id, principal.getName(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/records/{id}/mark-paid")
    @RequirePermission(namespace = "royalties", action = "mark_paid")
    public ResponseEntity<Void> markPaid(@PathVariable String id, @RequestBody MarkPaidRequest req,
            Principal principal) {
        service.markPaid(id, req.getPaymentRef(), req.getPaidAt(), principal.getName(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/records/{id}/reject")
    @RequirePermission(namespace = "royalties", action = "editor_confirm")
    public ResponseEntity<Void> reject(@PathVariable String id, @RequestBody RejectRequest req,
            Principal principal) {
        service.reject(id, req.getReasonNote(), principal.getName(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/records/{id}/override")
    @RequirePermission(namespace = "royalties", action = "editor_confirm") // Approx permission
    public ResponseEntity<Void> override(@PathVariable String id, @RequestBody OverrideRequest req,
            Principal principal) {
        service.overrideAmount(id, req, principal.getName(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/batches")
    @RequirePermission(namespace = "royalties", action = "finance_approve")
    public ResponseEntity<Object> createBatch(@RequestParam String month, Principal principal) {
        return ResponseEntity.ok(service.createBatch(month, principal.getName(), principal.getName()));
    }

    @GetMapping("/batches/{id}/export.csv")
    @RequirePermission(namespace = "royalties", action = "finance_approve")
    public ResponseEntity<String> exportBatch(@PathVariable String id) {
        String csv = service.exportBatchToCsv(id);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"payroll-" + id + ".csv\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csv);
    }
}
