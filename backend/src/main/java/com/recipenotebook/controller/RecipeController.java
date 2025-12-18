package com.recipenotebook.controller;

import com.recipenotebook.dto.*;
import com.recipenotebook.entity.Difficulty;
import com.recipenotebook.exception.QueryParameterValidationException;
import com.recipenotebook.service.RecipeFilterCriteria;
import com.recipenotebook.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
@Slf4j
public class RecipeController {
    
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("title", "cookingTimeMinutes", "createdAt", "updatedAt");
    private static final Set<String> ALLOWED_DIRECTIONS = Set.of("asc", "desc");
    private static final int MIN_PAGE_SIZE = 1;
    private static final int MAX_PAGE_SIZE = 100;
    
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
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeDetailDTO>> getRecipeById(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.debug("Received get recipe request for recipe {} from user: {}", id, userId);
        
        RecipeDetailDTO recipe = recipeService.getRecipeById(id, userId);
        
        return ResponseEntity.ok(ApiResponse.success("Recipe retrieved successfully", recipe));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.debug("Received delete request for recipe {} from user: {}", id, userId);
        
        recipeService.deleteRecipe(id, userId);
        
        return ResponseEntity.ok(ApiResponse.success("Recipe deleted successfully", null));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<RecipeListResponseData>> getRecipes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String categoryIds,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.debug("Received get recipes request from user: {} with params - page: {}, size: {}, sort: {}, direction: {}, categoryIds: {}, difficulty: {}, search: '{}'",
            userId, page, size, sort, direction, categoryIds, difficulty, search);
        
        Map<String, String> errors = validateQueryParameters(page, size, sort, direction, difficulty, categoryIds);
        if (!errors.isEmpty()) {
            throw new QueryParameterValidationException(errors);
        }
        
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(userId);
        criteria.setPage(page);
        criteria.setSize(size);
        criteria.setSortField(sort);
        criteria.setSortDirection(direction);
        criteria.setSearchQuery(search);
        
        if (difficulty != null && !difficulty.trim().isEmpty()) {
            criteria.setDifficulty(Difficulty.valueOf(difficulty.toUpperCase()));
        }
        
        if (categoryIds != null && !categoryIds.trim().isEmpty()) {
            List<Long> categoryIdList = parseCategoryIds(categoryIds);
            criteria.setCategoryIds(categoryIdList);
        }
        
        RecipeListResponseData data = recipeService.getRecipes(criteria);
        
        return ResponseEntity.ok(ApiResponse.success("Recipes retrieved successfully", data));
    }
    
    private Map<String, String> validateQueryParameters(int page, int size, String sort, 
                                                        String direction, String difficulty, String categoryIds) {
        Map<String, String> errors = new HashMap<>();
        
        if (page < 0) {
            errors.put("page", "Page number must be >= 0");
        }
        
        if (size < MIN_PAGE_SIZE || size > MAX_PAGE_SIZE) {
            errors.put("size", "Page size must be between " + MIN_PAGE_SIZE + " and " + MAX_PAGE_SIZE);
        }
        
        if (!ALLOWED_SORT_FIELDS.contains(sort)) {
            errors.put("sort", "Must be one of: " + String.join(", ", ALLOWED_SORT_FIELDS));
        }
        
        if (!ALLOWED_DIRECTIONS.contains(direction.toLowerCase())) {
            errors.put("direction", "Must be one of: asc, desc");
        }
        
        if (difficulty != null && !difficulty.trim().isEmpty()) {
            try {
                Difficulty.valueOf(difficulty.toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.put("difficulty", "Must be one of: EASY, MEDIUM, HARD");
            }
        }
        
        if (categoryIds != null && !categoryIds.trim().isEmpty()) {
            try {
                parseCategoryIds(categoryIds);
            } catch (NumberFormatException e) {
                errors.put("categoryIds", "Category IDs must be valid numbers");
            }
        }
        
        return errors;
    }
    
    private List<Long> parseCategoryIds(String categoryIds) {
        return Arrays.stream(categoryIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }
}
