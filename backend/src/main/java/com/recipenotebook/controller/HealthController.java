package com.recipenotebook.controller;

import com.recipenotebook.dto.HealthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class HealthController {
    
    private final DataSource dataSource;
    
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        try (Connection connection = dataSource.getConnection()) {
            HealthResponse response = new HealthResponse("UP", "UP");
            return ResponseEntity.ok(response);
        } catch (SQLException e) {
            log.warn("Database connection check failed: {}", e.getMessage());
            HealthResponse response = new HealthResponse("DOWN", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        } catch (Exception e) {
            log.error("Unexpected error during health check", e);
            HealthResponse response = new HealthResponse("DOWN", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
