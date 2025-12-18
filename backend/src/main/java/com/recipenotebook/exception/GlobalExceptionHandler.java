package com.recipenotebook.exception;

import com.recipenotebook.dto.ApiResponse;
import com.recipenotebook.dto.ErrorDetails;
import com.recipenotebook.dto.ValidationErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ValidationErrorResponse>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        log.warn("Validation failed: {}", errors);
        
        ValidationErrorResponse errorResponse = new ValidationErrorResponse(errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errorResponse));
    }
    
    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorDetails>> handleCategoryNotFoundException(
            CategoryNotFoundException ex) {
        
        Map<String, String> errors = new HashMap<>();
        errors.put("categoryIds", ex.getMessage());
        
        ErrorDetails errorDetails = new ErrorDetails(errors);
        
        log.warn("Category validation failed: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Invalid category ID", errorDetails));
    }
    
    @ExceptionHandler(RecipeNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleRecipeNotFoundException(
            RecipeNotFoundException ex) {
        
        log.warn("Recipe not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Recipe not found", null));
    }
    
    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsernameExists(
            UsernameAlreadyExistsException ex) {
        
        log.warn("Registration attempt with existing username: {}", ex.getUsername());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Username already exists", null));
    }
    
    @ExceptionHandler(RegistrationException.class)
    public ResponseEntity<ApiResponse<Void>> handleRegistrationError(
            RegistrationException ex) {
        
        log.error("Registration failed", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred during registration", null));
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
            AuthenticationException ex) {
        
        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password", null));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        
        log.error("Unexpected error occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred", null));
    }
}
