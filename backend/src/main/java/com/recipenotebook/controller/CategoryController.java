package com.recipenotebook.controller;

import com.recipenotebook.dto.ApiResponse;
import com.recipenotebook.dto.CategoriesResponseData;
import com.recipenotebook.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<CategoriesResponseData>> getCategories() {
        log.info("GET /api/v1/categories - Retrieving all categories");
        
        CategoriesResponseData data = categoryService.getAllCategories();
        
        return ResponseEntity.ok(
            ApiResponse.success("Categories retrieved successfully", data)
        );
    }
}
