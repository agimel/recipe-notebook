package com.recipenotebook.service;

import com.recipenotebook.dto.*;
import com.recipenotebook.entity.*;
import com.recipenotebook.exception.CategoryNotFoundException;
import com.recipenotebook.exception.RecipeNotFoundException;
import com.recipenotebook.repository.CategoryRepository;
import com.recipenotebook.repository.RecipeRepository;
import com.recipenotebook.repository.RecipeSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
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
    
    @Transactional(readOnly = true)
    public RecipeDetailDTO getRecipeById(Long recipeId, Long userId) {
        log.info("Retrieving recipe {} for user {}", recipeId, userId);
        
        Recipe recipe = recipeRepository.findByIdAndUserId(recipeId, userId)
            .orElseThrow(() -> new RecipeNotFoundException("Recipe not found"));
        
        recipe.getIngredients().size();
        recipe.getSteps().size();
        recipe.getCategories().size();
        
        RecipeDetailDTO dto = new RecipeDetailDTO();
        dto.setId(recipe.getId());
        dto.setTitle(recipe.getTitle());
        dto.setDifficulty(recipe.getDifficulty().name());
        dto.setCookingTimeMinutes(recipe.getCookingTimeMinutes());
        dto.setCreatedAt(recipe.getCreatedAt());
        dto.setUpdatedAt(recipe.getUpdatedAt());
        
        List<IngredientDTO> ingredientDTOs = recipe.getIngredients().stream()
            .sorted(Comparator.comparing(Ingredient::getSortOrder))
            .map(ing -> new IngredientDTO(
                ing.getId(),
                ing.getQuantity(),
                ing.getUnit(),
                ing.getName(),
                ing.getSortOrder()
            ))
            .collect(Collectors.toList());
        dto.setIngredients(ingredientDTOs);
        
        List<StepDTO> stepDTOs = recipe.getSteps().stream()
            .sorted(Comparator.comparing(Step::getStepNumber))
            .map(step -> new StepDTO(
                step.getId(),
                step.getStepNumber(),
                step.getInstruction()
            ))
            .collect(Collectors.toList());
        dto.setSteps(stepDTOs);
        
        List<CategoryDTO> categoryDTOs = recipe.getCategories().stream()
            .map(cat -> new CategoryDTO(cat.getId(), cat.getName(), cat.getIsDefault()))
            .collect(Collectors.toList());
        dto.setCategories(categoryDTOs);
        
        log.info("Recipe {} retrieved successfully", recipeId);
        return dto;
    }
    
    @Transactional(readOnly = true)
    public RecipeListResponseData getRecipes(RecipeFilterCriteria criteria) {
        log.info("Retrieving recipes for user {} with filters - categoryIds: {}, difficulty: {}, search: '{}', page: {}, size: {}, sort: {} {}", 
            criteria.getUserId(), criteria.getCategoryIds(), criteria.getDifficulty(), 
            criteria.getSearchQuery(), criteria.getPage(), criteria.getSize(), 
            criteria.getSortField(), criteria.getSortDirection());
        
        Specification<Recipe> spec = Specification.where(RecipeSpecification.hasUserId(criteria.getUserId()))
            .and(RecipeSpecification.hasCategoryIds(criteria.getCategoryIds()))
            .and(RecipeSpecification.hasDifficulty(criteria.getDifficulty()))
            .and(RecipeSpecification.titleContains(criteria.getSearchQuery()));
        
        Sort.Direction direction = "desc".equalsIgnoreCase(criteria.getSortDirection()) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, criteria.getSortField());
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);
        
        Page<Recipe> recipePage = recipeRepository.findAll(spec, pageable);
        
        List<RecipeSummaryDTO> recipeDTOs = recipePage.getContent().stream()
            .map(this::convertToSummaryDTO)
            .collect(Collectors.toList());
        
        PaginationDTO paginationDTO = new PaginationDTO(
            recipePage.getNumber(),
            recipePage.getTotalPages(),
            recipePage.getTotalElements(),
            recipePage.getSize(),
            recipePage.hasNext(),
            recipePage.hasPrevious()
        );
        
        log.info("Retrieved {} recipes out of {} total for user {}", 
            recipeDTOs.size(), recipePage.getTotalElements(), criteria.getUserId());
        
        return new RecipeListResponseData(recipeDTOs, paginationDTO);
    }
    
    private RecipeSummaryDTO convertToSummaryDTO(Recipe recipe) {
        recipe.getCategories().size();
        
        List<CategoryDTO> categoryDTOs = recipe.getCategories().stream()
            .map(cat -> new CategoryDTO(cat.getId(), cat.getName(), cat.getIsDefault()))
            .collect(Collectors.toList());
        
        return new RecipeSummaryDTO(
            recipe.getId(),
            recipe.getTitle(),
            recipe.getDifficulty().name(),
            recipe.getCookingTimeMinutes(),
            categoryDTOs,
            recipe.getCreatedAt(),
            recipe.getUpdatedAt()
        );
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
