package com.hyperion.cms;

import com.hyperion.cms.security.PermissionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HyperionBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    @WithMockUser
    void testGetArticlesWithoutClaimsIgnoresPermissionCheckForTest() throws Exception {
        // Since we mock user but don't inject JWT claims in this simple test
        // annotation,
        // the PermissionService needs to handle missing claims gracefully or we expect
        // 403 because permissions are missing.
        // Our controller checks permissionService.can("articles", "read").
        // Without specific claims, it returns false -> 403.
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isForbidden());
    }
}
