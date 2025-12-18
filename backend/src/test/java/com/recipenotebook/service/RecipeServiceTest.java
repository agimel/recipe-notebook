package com.recipenotebook.service;

import com.recipenotebook.dto.CreateRecipeRequest;
import com.recipenotebook.dto.IngredientRequest;
import com.recipenotebook.dto.RecipeDetailDTO;
import com.recipenotebook.dto.StepRequest;
import com.recipenotebook.entity.*;
import com.recipenotebook.exception.CategoryNotFoundException;
import com.recipenotebook.exception.RecipeNotFoundException;
import com.recipenotebook.repository.CategoryRepository;
import com.recipenotebook.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {
    
    @Mock
    private RecipeRepository recipeRepository;
    
    @Mock
    private CategoryRepository categoryRepository;
    
    @InjectMocks
    private RecipeService recipeService;
    
    private CreateRecipeRequest validRequest;
    private List<Category> categories;
    
    @BeforeEach
    void setUp() {
        validRequest = new CreateRecipeRequest();
        validRequest.setTitle("Test Recipe");
        validRequest.setDifficulty("MEDIUM");
        validRequest.setCookingTimeMinutes(30);
        validRequest.setCategoryIds(Arrays.asList(1L, 2L));
        
        validRequest.setIngredients(Arrays.asList(
            new IngredientRequest("2", "cups", "flour"),
            new IngredientRequest("1", "cup", "sugar"),
            new IngredientRequest("1/2", "tsp", "salt")
        ));
        
        validRequest.setSteps(Arrays.asList(
            new StepRequest("Mix dry ingredients"),
            new StepRequest("Add wet ingredients"),
            new StepRequest("Bake at 350°F")
        ));
        
        categories = Arrays.asList(
            new Category(1L, "Dessert", false),
            new Category(2L, "Quick & Easy", false)
        );
    }
    
    @Test
    void createRecipe_WithValidRequest_ReturnsRecipeId() {
        Long userId = 123L;
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(42L);
        
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        Long recipeId = recipeService.createRecipe(validRequest, userId);
        
        assertThat(recipeId).isEqualTo(42L);
        verify(categoryRepository, times(2)).findAllById(Arrays.asList(1L, 2L));
        verify(recipeRepository).save(any(Recipe.class));
    }
    
    @Test
    void createRecipe_SetsCorrectRecipeProperties() {
        Long userId = 123L;
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(42L);
        
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        recipeService.createRecipe(validRequest, userId);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getUserId()).isEqualTo(userId);
        assertThat(capturedRecipe.getTitle()).isEqualTo("Test Recipe");
        assertThat(capturedRecipe.getDifficulty()).isEqualTo(Difficulty.MEDIUM);
        assertThat(capturedRecipe.getCookingTimeMinutes()).isEqualTo(30);
    }
    
    @Test
    void createRecipe_AssignsSequentialSortOrderToIngredients() {
        Long userId = 123L;
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(42L);
        
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        recipeService.createRecipe(validRequest, userId);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getIngredients()).hasSize(3);
        assertThat(capturedRecipe.getIngredients().get(0).getSortOrder()).isEqualTo(1);
        assertThat(capturedRecipe.getIngredients().get(0).getQuantity()).isEqualTo("2");
        assertThat(capturedRecipe.getIngredients().get(0).getUnit()).isEqualTo("cups");
        assertThat(capturedRecipe.getIngredients().get(0).getName()).isEqualTo("flour");
        
        assertThat(capturedRecipe.getIngredients().get(1).getSortOrder()).isEqualTo(2);
        assertThat(capturedRecipe.getIngredients().get(1).getQuantity()).isEqualTo("1");
        assertThat(capturedRecipe.getIngredients().get(1).getUnit()).isEqualTo("cup");
        assertThat(capturedRecipe.getIngredients().get(1).getName()).isEqualTo("sugar");
        
        assertThat(capturedRecipe.getIngredients().get(2).getSortOrder()).isEqualTo(3);
        assertThat(capturedRecipe.getIngredients().get(2).getQuantity()).isEqualTo("1/2");
        assertThat(capturedRecipe.getIngredients().get(2).getUnit()).isEqualTo("tsp");
        assertThat(capturedRecipe.getIngredients().get(2).getName()).isEqualTo("salt");
    }
    
    @Test
    void createRecipe_AssignsSequentialStepNumberToSteps() {
        Long userId = 123L;
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(42L);
        
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        recipeService.createRecipe(validRequest, userId);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getSteps()).hasSize(3);
        assertThat(capturedRecipe.getSteps().get(0).getStepNumber()).isEqualTo(1);
        assertThat(capturedRecipe.getSteps().get(0).getInstruction()).isEqualTo("Mix dry ingredients");
        
        assertThat(capturedRecipe.getSteps().get(1).getStepNumber()).isEqualTo(2);
        assertThat(capturedRecipe.getSteps().get(1).getInstruction()).isEqualTo("Add wet ingredients");
        
        assertThat(capturedRecipe.getSteps().get(2).getStepNumber()).isEqualTo(3);
        assertThat(capturedRecipe.getSteps().get(2).getInstruction()).isEqualTo("Bake at 350°F");
    }
    
    @Test
    void createRecipe_AssociatesCategories() {
        Long userId = 123L;
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(42L);
        
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        recipeService.createRecipe(validRequest, userId);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getCategories()).hasSize(2);
        assertThat(capturedRecipe.getCategories()).extracting(Category::getId)
            .containsExactlyInAnyOrder(1L, 2L);
    }
    
    @Test
    void createRecipe_WithNonExistentCategory_ThrowsCategoryNotFoundException() {
        Long userId = 123L;
        
        when(categoryRepository.findAllById(anyList()))
            .thenReturn(Arrays.asList(categories.get(0)));
        
        assertThatThrownBy(() -> recipeService.createRecipe(validRequest, userId))
            .isInstanceOf(CategoryNotFoundException.class)
            .hasMessageContaining("Category with ID 2 does not exist");
        
        verify(categoryRepository).findAllById(Arrays.asList(1L, 2L));
        verify(recipeRepository, never()).save(any(Recipe.class));
    }
    
    @Test
    void createRecipe_WithAllNonExistentCategories_ThrowsCategoryNotFoundException() {
        Long userId = 123L;
        
        when(categoryRepository.findAllById(anyList())).thenReturn(Arrays.asList());
        
        assertThatThrownBy(() -> recipeService.createRecipe(validRequest, userId))
            .isInstanceOf(CategoryNotFoundException.class)
            .hasMessageContaining("Category with ID");
        
        verify(recipeRepository, never()).save(any(Recipe.class));
    }
    
    @Test
    void createRecipe_ValidatesCategoriesBeforeSaving() {
        Long userId = 123L;
        
        when(categoryRepository.findAllById(anyList()))
            .thenReturn(Arrays.asList(categories.get(0)));
        
        assertThatThrownBy(() -> recipeService.createRecipe(validRequest, userId))
            .isInstanceOf(CategoryNotFoundException.class);
        
        verify(categoryRepository).findAllById(anyList());
        verify(recipeRepository, never()).save(any(Recipe.class));
    }
    
    @Test
    void createRecipe_WithSingleIngredient_AssignsSortOrder() {
        Long userId = 123L;
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(42L);
        
        validRequest.setIngredients(Arrays.asList(
            new IngredientRequest("1", "cup", "water")
        ));
        
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        recipeService.createRecipe(validRequest, userId);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getIngredients()).hasSize(1);
        assertThat(capturedRecipe.getIngredients().get(0).getSortOrder()).isEqualTo(1);
    }
    
    @Test
    void createRecipe_WithTwoSteps_AssignsStepNumbers() {
        Long userId = 123L;
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(42L);
        
        validRequest.setSteps(Arrays.asList(
            new StepRequest("First step"),
            new StepRequest("Second step")
        ));
        
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        recipeService.createRecipe(validRequest, userId);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getSteps()).hasSize(2);
        assertThat(capturedRecipe.getSteps().get(0).getStepNumber()).isEqualTo(1);
        assertThat(capturedRecipe.getSteps().get(1).getStepNumber()).isEqualTo(2);
    }
    
    @Test
    void updateRecipe_WithValidRequest_ReturnsRecipeId() {
        Long recipeId = 42L;
        Long userId = 123L;
        Recipe existingRecipe = createExistingRecipe(recipeId, userId);
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(existingRecipe));
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(existingRecipe);
        
        Long returnedId = recipeService.updateRecipe(recipeId, userId, validRequest);
        
        assertThat(returnedId).isEqualTo(recipeId);
        verify(recipeRepository).findById(recipeId);
        verify(categoryRepository, times(2)).findAllById(Arrays.asList(1L, 2L));
        verify(recipeRepository).save(any(Recipe.class));
    }
    
    @Test
    void updateRecipe_UpdatesRecipeProperties() {
        Long recipeId = 42L;
        Long userId = 123L;
        Recipe existingRecipe = createExistingRecipe(recipeId, userId);
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(existingRecipe));
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(existingRecipe);
        
        recipeService.updateRecipe(recipeId, userId, validRequest);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getId()).isEqualTo(recipeId);
        assertThat(capturedRecipe.getUserId()).isEqualTo(userId);
        assertThat(capturedRecipe.getTitle()).isEqualTo("Test Recipe");
        assertThat(capturedRecipe.getDifficulty()).isEqualTo(Difficulty.MEDIUM);
        assertThat(capturedRecipe.getCookingTimeMinutes()).isEqualTo(30);
    }
    
    @Test
    void updateRecipe_ReplacesIngredients() {
        Long recipeId = 42L;
        Long userId = 123L;
        Recipe existingRecipe = createExistingRecipe(recipeId, userId);
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(existingRecipe));
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(existingRecipe);
        
        recipeService.updateRecipe(recipeId, userId, validRequest);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getIngredients()).hasSize(3);
        assertThat(capturedRecipe.getIngredients().get(0).getName()).isEqualTo("flour");
        assertThat(capturedRecipe.getIngredients().get(1).getName()).isEqualTo("sugar");
        assertThat(capturedRecipe.getIngredients().get(2).getName()).isEqualTo("salt");
    }
    
    @Test
    void updateRecipe_ReplacesSteps() {
        Long recipeId = 42L;
        Long userId = 123L;
        Recipe existingRecipe = createExistingRecipe(recipeId, userId);
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(existingRecipe));
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(existingRecipe);
        
        recipeService.updateRecipe(recipeId, userId, validRequest);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getSteps()).hasSize(3);
        assertThat(capturedRecipe.getSteps().get(0).getInstruction()).isEqualTo("Mix dry ingredients");
        assertThat(capturedRecipe.getSteps().get(1).getInstruction()).isEqualTo("Add wet ingredients");
        assertThat(capturedRecipe.getSteps().get(2).getInstruction()).isEqualTo("Bake at 350°F");
    }
    
    @Test
    void updateRecipe_ReplacesCategories() {
        Long recipeId = 42L;
        Long userId = 123L;
        Recipe existingRecipe = createExistingRecipe(recipeId, userId);
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(existingRecipe));
        when(categoryRepository.findAllById(anyList())).thenReturn(categories);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(existingRecipe);
        
        recipeService.updateRecipe(recipeId, userId, validRequest);
        
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertThat(capturedRecipe.getCategories()).hasSize(2);
        assertThat(capturedRecipe.getCategories()).extracting(Category::getId)
            .containsExactlyInAnyOrder(1L, 2L);
    }
    
    @Test
    void updateRecipe_WithNonExistentRecipe_ThrowsRecipeNotFoundException() {
        Long recipeId = 999L;
        Long userId = 123L;
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.empty());
        
        assertThatThrownBy(() -> recipeService.updateRecipe(recipeId, userId, validRequest))
            .isInstanceOf(RecipeNotFoundException.class)
            .hasMessageContaining("Recipe not found");
        
        verify(recipeRepository).findById(recipeId);
        verify(recipeRepository, never()).save(any(Recipe.class));
    }
    
    @Test
    void updateRecipe_WithDifferentUser_ThrowsRecipeNotFoundException() {
        Long recipeId = 42L;
        Long ownerId = 123L;
        Long differentUserId = 456L;
        Recipe existingRecipe = createExistingRecipe(recipeId, ownerId);
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(existingRecipe));
        
        assertThatThrownBy(() -> recipeService.updateRecipe(recipeId, differentUserId, validRequest))
            .isInstanceOf(RecipeNotFoundException.class)
            .hasMessageContaining("Recipe not found");
        
        verify(recipeRepository).findById(recipeId);
        verify(recipeRepository, never()).save(any(Recipe.class));
    }
    
    @Test
    void updateRecipe_WithInvalidCategory_ThrowsCategoryNotFoundException() {
        Long recipeId = 42L;
        Long userId = 123L;
        Recipe existingRecipe = createExistingRecipe(recipeId, userId);
        
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(existingRecipe));
        when(categoryRepository.findAllById(anyList()))
            .thenReturn(Arrays.asList(categories.get(0)));
        
        assertThatThrownBy(() -> recipeService.updateRecipe(recipeId, userId, validRequest))
            .isInstanceOf(CategoryNotFoundException.class)
            .hasMessageContaining("Category with ID 2 does not exist");
        
        verify(recipeRepository).findById(recipeId);
        verify(categoryRepository).findAllById(Arrays.asList(1L, 2L));
        verify(recipeRepository, never()).save(any(Recipe.class));
    }
    
    private Recipe createExistingRecipe(Long recipeId, Long userId) {
        Recipe recipe = new Recipe();
        recipe.setId(recipeId);
        recipe.setUserId(userId);
        recipe.setTitle("Old Title");
        recipe.setDifficulty(Difficulty.EASY);
        recipe.setCookingTimeMinutes(15);
        return recipe;
    }
    
    @Test
    void getRecipeById_WithValidRecipeAndUser_ReturnsRecipeDetailDTO() {
        Long recipeId = 1L;
        Long userId = 123L;
        Recipe recipe = createRecipeWithAssociations(recipeId, userId);
        
        when(recipeRepository.findByIdAndUserId(recipeId, userId)).thenReturn(Optional.of(recipe));
        
        RecipeDetailDTO result = recipeService.getRecipeById(recipeId, userId);
        
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(recipeId);
        assertThat(result.getTitle()).isEqualTo("Test Recipe");
        assertThat(result.getDifficulty()).isEqualTo("MEDIUM");
        assertThat(result.getCookingTimeMinutes()).isEqualTo(30);
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        
        verify(recipeRepository).findByIdAndUserId(recipeId, userId);
    }
    
    @Test
    void getRecipeById_ReturnsIngredientsSortedByOrder() {
        Long recipeId = 1L;
        Long userId = 123L;
        Recipe recipe = createRecipeWithAssociations(recipeId, userId);
        
        when(recipeRepository.findByIdAndUserId(recipeId, userId)).thenReturn(Optional.of(recipe));
        
        RecipeDetailDTO result = recipeService.getRecipeById(recipeId, userId);
        
        assertThat(result.getIngredients()).hasSize(3);
        assertThat(result.getIngredients().get(0).getName()).isEqualTo("flour");
        assertThat(result.getIngredients().get(0).getSortOrder()).isEqualTo(1);
        assertThat(result.getIngredients().get(0).getQuantity()).isEqualTo("2");
        assertThat(result.getIngredients().get(0).getUnit()).isEqualTo("cups");
        
        assertThat(result.getIngredients().get(1).getName()).isEqualTo("sugar");
        assertThat(result.getIngredients().get(1).getSortOrder()).isEqualTo(2);
        
        assertThat(result.getIngredients().get(2).getName()).isEqualTo("salt");
        assertThat(result.getIngredients().get(2).getSortOrder()).isEqualTo(3);
    }
    
    @Test
    void getRecipeById_ReturnsStepsSortedByStepNumber() {
        Long recipeId = 1L;
        Long userId = 123L;
        Recipe recipe = createRecipeWithAssociations(recipeId, userId);
        
        when(recipeRepository.findByIdAndUserId(recipeId, userId)).thenReturn(Optional.of(recipe));
        
        RecipeDetailDTO result = recipeService.getRecipeById(recipeId, userId);
        
        assertThat(result.getSteps()).hasSize(3);
        assertThat(result.getSteps().get(0).getStepNumber()).isEqualTo(1);
        assertThat(result.getSteps().get(0).getInstruction()).isEqualTo("Mix dry ingredients");
        
        assertThat(result.getSteps().get(1).getStepNumber()).isEqualTo(2);
        assertThat(result.getSteps().get(1).getInstruction()).isEqualTo("Add wet ingredients");
        
        assertThat(result.getSteps().get(2).getStepNumber()).isEqualTo(3);
        assertThat(result.getSteps().get(2).getInstruction()).isEqualTo("Bake at 350°F");
    }
    
    @Test
    void getRecipeById_ReturnsCategories() {
        Long recipeId = 1L;
        Long userId = 123L;
        Recipe recipe = createRecipeWithAssociations(recipeId, userId);
        
        when(recipeRepository.findByIdAndUserId(recipeId, userId)).thenReturn(Optional.of(recipe));
        
        RecipeDetailDTO result = recipeService.getRecipeById(recipeId, userId);
        
        assertThat(result.getCategories()).hasSize(2);
        assertThat(result.getCategories().get(0).getName()).isEqualTo("Dessert");
        assertThat(result.getCategories().get(1).getName()).isEqualTo("Quick & Easy");
    }
    
    @Test
    void getRecipeById_WithNonExistentRecipe_ThrowsRecipeNotFoundException() {
        Long recipeId = 999L;
        Long userId = 123L;
        
        when(recipeRepository.findByIdAndUserId(recipeId, userId)).thenReturn(Optional.empty());
        
        assertThatThrownBy(() -> recipeService.getRecipeById(recipeId, userId))
            .isInstanceOf(RecipeNotFoundException.class)
            .hasMessage("Recipe not found");
        
        verify(recipeRepository).findByIdAndUserId(recipeId, userId);
    }
    
    @Test
    void getRecipeById_WithDifferentUserId_ThrowsRecipeNotFoundException() {
        Long recipeId = 1L;
        Long userId = 123L;
        Long differentUserId = 456L;
        
        when(recipeRepository.findByIdAndUserId(recipeId, differentUserId)).thenReturn(Optional.empty());
        
        assertThatThrownBy(() -> recipeService.getRecipeById(recipeId, differentUserId))
            .isInstanceOf(RecipeNotFoundException.class)
            .hasMessage("Recipe not found");
        
        verify(recipeRepository).findByIdAndUserId(recipeId, differentUserId);
    }
    
    private Recipe createRecipeWithAssociations(Long recipeId, Long userId) {
        Recipe recipe = new Recipe();
        recipe.setId(recipeId);
        recipe.setUserId(userId);
        recipe.setTitle("Test Recipe");
        recipe.setDifficulty(Difficulty.MEDIUM);
        recipe.setCookingTimeMinutes(30);
        recipe.setCreatedAt(LocalDateTime.now());
        recipe.setUpdatedAt(LocalDateTime.now());
        
        Ingredient ing1 = new Ingredient(1L, recipe, "2", "cups", "flour", 1);
        Ingredient ing2 = new Ingredient(2L, recipe, "1", "cup", "sugar", 2);
        Ingredient ing3 = new Ingredient(3L, recipe, "1/2", "tsp", "salt", 3);
        recipe.getIngredients().addAll(Arrays.asList(ing1, ing2, ing3));
        
        Step step1 = new Step(1L, recipe, 1, "Mix dry ingredients");
        Step step2 = new Step(2L, recipe, 2, "Add wet ingredients");
        Step step3 = new Step(3L, recipe, 3, "Bake at 350°F");
        recipe.getSteps().addAll(Arrays.asList(step1, step2, step3));
        
        Category cat1 = new Category(1L, "Dessert", false);
        Category cat2 = new Category(2L, "Quick & Easy", false);
        recipe.getCategories().addAll(Arrays.asList(cat1, cat2));
        
        return recipe;
    }
}
