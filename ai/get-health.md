# Endpoint: GET /api/health

## Endpoint Details

**HTTP Method**: GET  
**Path**: `/api/health`  
**Description**: Application health check endpoint  
**Authentication**: None required

### Success Response (HTTP 200)

```json
{
  "status": "UP",
  "timestamp": "2025-12-17T15:30:00Z",
  "database": "UP"
}
```

### Error Response (HTTP 503)

```json
{
  "status": "DOWN",
  "timestamp": "2025-12-17T15:30:00Z",
  "database": "DOWN"
}
```

### Notes

- Used for monitoring and deployment verification
- Checks database connectivity
- No authentication required

---

## Related Database Resources

### Health Check Query

The health endpoint performs a simple database connectivity check. This can be implemented as:

```java
// Simple query to verify database connection
@Query("SELECT COUNT(u) FROM User u")
long healthCheck();
```

Or using Spring Boot Actuator's built-in health checks.

### Design Notes

- No specific tables involved
- Verifies H2 database is accessible
- Returns UP if database connection succeeds
- Returns DOWN if database connection fails

### Configuration

This endpoint is typically exposed without authentication for monitoring systems.

```java
@RestController
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    @GetMapping("/api/health")
    public ResponseEntity<HealthResponse> health() {
        try {
            // Test database connectivity
            Connection conn = dataSource.getConnection();
            conn.close();
            
            return ResponseEntity.ok(new HealthResponse("UP", "UP"));
        } catch (Exception e) {
            return ResponseEntity.status(503)
                .body(new HealthResponse("DOWN", "DOWN"));
        }
    }
}
```
