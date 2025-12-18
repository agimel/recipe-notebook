package com.recipenotebook.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
public class HealthResponse {
    private String status;
    private String timestamp;
    private String database;
    
    public HealthResponse(String status, String database) {
        this.status = status;
        this.database = database;
        this.timestamp = Instant.now().toString();
    }
}
