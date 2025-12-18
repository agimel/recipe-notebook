package com.recipenotebook.service;

import com.recipenotebook.dto.CreateRecipeRequest;
import com.recipenotebook.dto.IngredientRequest;
import com.recipenotebook.dto.StepRequest;
import com.recipenotebook.entity.*;
import com.recipenotebook.exception.CategoryNotFoundException;
import com.recipenotebook.exception.RecipeNotFoundException;
import com.recipenotebook.repository.CategoryRepository;
import com.recipenotebook.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeService {
    
    private final RecipeRepository recipeRepository;
    private final CategoryRepository categoryRepository;
    
    @Transactional
    public Long createRecipe(CreateRecipeRequest request, Long userId) {
        log.info("Creating recipe for user {}", userId);
        
        validateCategories(request.getCategoryIds());
        
        Recipe recipe = new Recipe();
        recipe.setUserId(userId);
        recipe.setTitle(request.getTitle());
        recipe.setDifficulty(Difficulty.valueOf(request.getDifficulty()));
        recipe.setCookingTimeMinutes(request.getCookingTimeMinutes());
        
        int sortOrder = 1;
        for (IngredientRequest ingReq : request.getIngredients()) {
            Ingredient ingredient = new Ingredient();
            ingredient.setQuantity(ingReq.getQuantity());
            ingredient.setUnit(ingReq.getUnit());
            ingredient.setName(ingReq.getName());
            ingredient.setSortOrder(sortOrder++);
            recipe.addIngredient(ingredient);
        }
        
        int stepNumber = 1;
        for (StepRequest stepReq : request.getSteps()) {
            Step step = new Step();
            step.setInstruction(stepReq.getInstruction());
            step.setStepNumber(stepNumber++);
            recipe.addStep(step);
        }
        
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        categories.forEach(recipe::addCategory);
        
        Recipe savedRecipe = recipeRepository.save(recipe);
        log.info("Recipe created successfully with ID {}", savedRecipe.getId());
        
        return savedRecipe.getId();
    }
    
    @Transactional
    public Long updateRecipe(Long id, Long userId, CreateRecipeRequest request) {
        log.info("Updating recipe {} for user {}", id, userId);
        
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new RecipeNotFoundException("Recipe not found"));
        
        if (!recipe.getUserId().equals(userId)) {
            throw new RecipeNotFoundException("Recipe not found");
        }
        
        validateCategories(request.getCategoryIds());
        
        recipe.getIngredients().clear();
        recipe.getSteps().clear();
        recipe.getCategories().clear();
        
        recipe.setTitle(request.getTitle());
        recipe.setDifficulty(Difficulty.valueOf(request.getDifficulty()));
        recipe.setCookingTimeMinutes(request.getCookingTimeMinutes());
        
        int sortOrder = 1;
        for (IngredientRequest ingReq : request.getIngredients()) {
            Ingredient ingredient = new Ingredient();
            ingredient.setQuantity(ingReq.getQuantity());
            ingredient.setUnit(ingReq.getUnit());
            ingredient.setName(ingReq.getName());
            ingredient.setSortOrder(sortOrder++);
            recipe.addIngredient(ingredient);
        }
        
        int stepNumber = 1;
        for (StepRequest stepReq : request.getSteps()) {
            Step step = new Step();
            step.setInstruction(stepReq.getInstruction());
            step.setStepNumber(stepNumber++);
            recipe.addStep(step);
        }
        
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        categories.forEach(recipe::addCategory);
        
        Recipe updatedRecipe = recipeRepository.save(recipe);
        log.info("Recipe {} updated successfully", updatedRecipe.getId());
        
        return updatedRecipe.getId();
    }
    
    private void validateCategories(List<Long> categoryIds) {
        List<Long> existingIds = categoryRepository.findAllById(categoryIds)
            .stream()
            .map(Category::getId)
            .collect(Collectors.toList());
        
        List<Long> invalidIds = categoryIds.stream()
            .filter(id -> !existingIds.contains(id))
            .collect(Collectors.toList());
        
        if (!invalidIds.isEmpty()) {
            throw new CategoryNotFoundException(
                "Category with ID " + invalidIds.get(0) + " does not exist"
            );
        }
    }
}
