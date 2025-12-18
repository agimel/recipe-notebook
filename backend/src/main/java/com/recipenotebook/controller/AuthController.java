package com.recipenotebook.controller;

import com.recipenotebook.dto.ApiResponse;
import com.recipenotebook.dto.LoginRequestDTO;
import com.recipenotebook.dto.LoginResponseDTO;
import com.recipenotebook.dto.RegisterRequest;
import com.recipenotebook.dto.RegisterResponse;
import com.recipenotebook.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        
        log.debug("Received registration request for username: {}", request.getUsername());
        
        RegisterResponse response = authService.registerUser(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        
        log.debug("Received login request for username: {}", request.getUsername());
        
        LoginResponseDTO loginResponse = authService.login(
                request.getUsername(), 
                request.getPassword()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }
}
