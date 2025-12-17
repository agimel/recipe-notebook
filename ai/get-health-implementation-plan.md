# API Endpoint Implementation Plan: GET /api/health

## 1. Endpoint Overview

A simple health check endpoint that verifies the application and database are operational. This endpoint is designed for monitoring systems, load balancers, and deployment verification. It performs a lightweight database connectivity check and returns the operational status of both the application and database components.

## 2. Request Details

- **HTTP Method**: GET
- **URL Structure**: `/api/health`
- **Parameters**:
  - Required: None
  - Optional: None
- **Request Body**: None
- **Authentication**: Not required (public endpoint)

## 3. Types Used

### HealthResponse DTO

```java
public class HealthResponse {
    private String status;           // "UP" or "DOWN"
    private String timestamp;        // ISO-8601 format
    private String database;         // "UP" or "DOWN"
    
    // Constructor, getters, setters
}
```

## 4. Response Details

### Success Response (HTTP 200)

When both application and database are operational:

```json
{
  "status": "UP",
  "timestamp": "2025-12-17T15:30:00Z",
  "database": "UP"
}
```

### Service Unavailable Response (HTTP 503)

When database connectivity fails:

```json
{
  "status": "DOWN",
  "timestamp": "2025-12-17T15:30:00Z",
  "database": "DOWN"
}
```

## 5. Data Flow

1. Client sends GET request to `/api/health`
2. Controller receives request (no authentication check)
3. Service attempts database connectivity check:
   - Obtain connection from DataSource
   - Execute simple query or verify connection
   - Close connection
4. If successful: Return HTTP 200 with "UP" status
5. If failed: Return HTTP 503 with "DOWN" status
6. Timestamp is generated at response creation time

## 6. Security Considerations

### Authentication & Authorization
- **No authentication required** - This is a public monitoring endpoint
- Accessible to monitoring systems, load balancers, and health checkers

### Data Validation
- No input validation needed (no parameters)

### Information Disclosure
- **Minimal information exposure** - Only reveals basic operational status
- Does not expose version numbers, internal paths, or sensitive configuration
- Does not reveal specific error details or stack traces

### Rate Limiting Considerations
- Consider implementing basic rate limiting to prevent abuse
- Health check endpoints can be targeted for denial-of-service
- Suggested: 60 requests per minute per IP (post-MVP enhancement)

## 7. Error Handling

### Database Connection Failure (HTTP 503)
- **Scenario**: H2 database file is locked, corrupted, or inaccessible
- **Response**: Return 503 with status "DOWN", database "DOWN"
- **Logging**: Log at WARN level with exception details

### Unexpected System Error (HTTP 503)
- **Scenario**: Any unexpected exception during health check
- **Response**: Return 503 with status "DOWN", database "DOWN"
- **Logging**: Log at ERROR level with full stack trace

### Timeout Scenario
- **Scenario**: Database connection hangs or takes too long
- **Mitigation**: Set connection timeout (e.g., 5 seconds)
- **Response**: Treat as database DOWN, return 503

## 8. Performance Considerations

### Potential Bottlenecks
- Database connection acquisition from pool
- Network latency to database (minimal for H2 file-based)

### Optimization Strategies
- Use connection pooling (Spring Boot default)
- Keep health check query extremely simple
- Set short connection timeout (5 seconds max)
- Avoid complex queries or table scans
- Consider caching health status for 5-10 seconds under high load (post-MVP)

### Expected Response Time
- Target: < 100ms for healthy system
- Timeout: 5000ms maximum

## 9. Implementation Steps

### Step 1: Create HealthResponse DTO
- Create `com.recipenotebook.dto.HealthResponse` class
- Add fields: `status`, `timestamp`, `database`
- Add constructor accepting status and database parameters
- Generate timestamp in constructor using `Instant.now().toString()`
- Add getters and setters (or use Lombok)

### Step 2: Create HealthController
- Create `com.recipenotebook.controller.HealthController` class
- Annotate with `@RestController`
- Inject `DataSource` dependency via constructor injection
- Create `@GetMapping("/api/health")` method
- Return `ResponseEntity<HealthResponse>`

### Step 3: Implement Database Connectivity Check
- In controller method, wrap logic in try-catch block
- Acquire connection from DataSource: `dataSource.getConnection()`
- Close connection immediately: `connection.close()`
- Use try-with-resources for automatic connection cleanup
- On success: Return 200 with "UP" status
- On exception: Return 503 with "DOWN" status

### Step 4: Add Logging
- Add SLF4J Logger to controller
- Log database connection failures at WARN level
- Log unexpected exceptions at ERROR level
- Include exception message in log output

### Step 5: Configure CORS (if needed)
- Ensure CORS configuration allows health endpoint access
- Health endpoint should be accessible from monitoring tools

### Step 6: Manual Testing
- Test with application running and database accessible (expect 200)
- Test with database stopped or file locked (expect 503)
- Verify timestamp format is ISO-8601
- Verify response time is under 100ms for healthy system
- Test from external monitoring tool or curl

### Step 7: Documentation
- Update API documentation with endpoint details
- Document expected response codes and formats
- Note that endpoint requires no authentication
- Provide example curl commands for testing

### Optional Post-MVP Enhancements
- Migrate to Spring Boot Actuator health endpoint
- Add additional health indicators (disk space, memory)
- Implement caching for high-frequency health checks
- Add rate limiting protection
- Create integration test for health endpoint
