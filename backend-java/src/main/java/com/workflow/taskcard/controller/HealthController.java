package com.workflow.taskcard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());
        health.put("service", "Workflow Tool — Spring Boot Track B");
        health.put("version", "1.0.0");

        try (Connection conn = dataSource.getConnection()) {
            health.put("database", conn.isValid(2) ? "connected" : "degraded");
        } catch (Exception e) {
            health.put("database", "disconnected");
            health.put("database_error", e.getMessage());
        }

        return ResponseEntity.ok(health);
    }
}
