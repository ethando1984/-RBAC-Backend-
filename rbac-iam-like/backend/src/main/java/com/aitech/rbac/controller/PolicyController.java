package com.aitech.rbac.controller;

import com.aitech.rbac.dto.PageResponse;
import com.aitech.rbac.model.PolicyVersion;
import com.aitech.rbac.service.PolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<com.aitech.rbac.model.Permission>> listPolicies(
            @RequestParam(required = false) String usage,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(policyService.search(usage, domain, search, page, size));
    }

    @GetMapping("/{id}/impact")
    public ResponseEntity<Map<String, Object>> getImpact(@PathVariable UUID id) {
        return ResponseEntity.ok(policyService.getImpact(id));
    }

    @PostMapping("/{id}/seal")
    public ResponseEntity<Void> sealPolicy(
            @PathVariable UUID id,
            @RequestBody SealRequest request) {
        policyService.seal(id, request.getMatrix(), request.isConfirmImpact());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<PolicyVersion>> getVersions(@PathVariable UUID id) {
        return ResponseEntity.ok(policyService.getVersions(id));
    }

    @PostMapping("/{id}/rollback/{versionId}")
    public ResponseEntity<Void> rollback(@PathVariable UUID id, @PathVariable UUID versionId) {
        policyService.rollback(id, versionId);
        return ResponseEntity.ok().build();
    }

    // DTO for Seal Request
    public static class SealRequest {
        private Map<String, Map<String, Boolean>> matrix;
        private boolean confirmImpact;

        public Map<String, Map<String, Boolean>> getMatrix() {
            return matrix;
        }

        public void setMatrix(Map<String, Map<String, Boolean>> matrix) {
            this.matrix = matrix;
        }

        public boolean isConfirmImpact() {
            return confirmImpact;
        }

        public void setConfirmImpact(boolean confirmImpact) {
            this.confirmImpact = confirmImpact;
        }
    }
}
