package com.hyperion.cms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalServiceFilter extends OncePerRequestFilter {

    @Value("${hyperion.mtls.service-token:dev-service-token}")
    private String expectedToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/internal/")) {
            String serviceName = request.getHeader("X-Service-Name");
            String serviceToken = request.getHeader("X-Service-Token");

            if (serviceName == null || serviceToken == null || !serviceToken.equals(expectedToken)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Forbidden: Invalid service credentials");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
