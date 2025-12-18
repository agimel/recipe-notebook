package com.recipenotebook.controller;

import com.recipenotebook.dto.ApiResponse;
import com.recipenotebook.dto.CreateRecipeRequest;
import com.recipenotebook.dto.RecipeIdResponse;
import com.recipenotebook.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
@Slf4j
public class RecipeController {
    
    private final RecipeService recipeService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<RecipeIdResponse>> createRecipe(
            @Valid @RequestBody CreateRecipeRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.debug("Received create recipe request from user: {}", userId);
        
        Long recipeId = recipeService.createRecipe(request, userId);
        
        RecipeIdResponse data = new RecipeIdResponse(recipeId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Recipe created successfully", data));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeIdResponse>> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody CreateRecipeRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.debug("Received update recipe request for recipe {} from user: {}", id, userId);
        
        Long recipeId = recipeService.updateRecipe(id, userId, request);
        
        RecipeIdResponse data = new RecipeIdResponse(recipeId);
        
        return ResponseEntity.ok(ApiResponse.success("Recipe updated successfully", data));
    }
}
