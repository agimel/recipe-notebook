# Manual Testing Guide: POST /auth/login

## Prerequisites

1. Ensure the application is running: `./mvnw spring-boot:run`
2. Application should be accessible at: `http://localhost:8080`
3. Install a REST client (curl, Postman, or HTTPie)

## Test Scenarios

### 1. Register a Test User First

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Expected Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "username": "testuser"
  }
}
```

### 2. Successful Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInN1YiI6InRlc3R1c2VyIiwiaWF0IjoxNzAzMDk4ODAwLCJleHAiOjE3MDMxODUyMDB9...",
    "username": "testuser",
    "expiresAt": "2025-12-18T15:30:00Z"
  }
}
```

#### Verify JWT Token

Decode the token at https://jwt.io/ and verify:
- **Algorithm**: HS256
- **Claims**:
  - `sub`: "testuser"
  - `userId`: 1
  - `iat`: Current timestamp
  - `exp`: 24 hours from `iat`

### 3. Login with Invalid Username

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nonexistentuser",
    "password": "password123"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "data": null
}
```

### 4. Login with Incorrect Password

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "wrongpassword"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "data": null
}
```

**Important Security Note**: The error message should be identical to scenario #3 to prevent username enumeration.

### 5. Login with Missing Username

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "username": "Username is required"
    }
  }
}
```

### 6. Login with Blank Password

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": ""
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "password": "Password is required"
    }
  }
}
```

### 7. Login with Both Fields Blank

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "",
    "password": ""
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "username": "Username is required",
      "password": "Password is required"
    }
  }
}
```

## Security Verification Checklist

- [ ] JWT token is valid and can be decoded
- [ ] Token contains `userId` and `sub` (username) claims
- [ ] Token expiration is exactly 24 hours from issuance
- [ ] Error message for non-existent username is identical to wrong password
- [ ] No passwords appear in logs or responses
- [ ] 401 status code is returned for authentication failures
- [ ] 400 status code is returned for validation failures

## Performance Notes

- Login with valid credentials should complete in < 200ms (including BCrypt verification)
- BCrypt password verification is intentionally slow (~100ms) for security

## Postman Collection (Optional)

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Recipe Notebook - Auth Login",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login - Success",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"password123\"\n}"
        },
        "url": "http://localhost:8080/api/v1/auth/login"
      }
    },
    {
      "name": "Login - Invalid Credentials",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"wrongpassword\"\n}"
        },
        "url": "http://localhost:8080/api/v1/auth/login"
      }
    },
    {
      "name": "Login - Missing Fields",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"\",\n  \"password\": \"\"\n}"
        },
        "url": "http://localhost:8080/api/v1/auth/login"
      }
    }
  ]
}
```
