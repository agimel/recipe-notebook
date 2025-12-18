package com.recipenotebook.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipenotebook.dto.CreateRecipeRequest;
import com.recipenotebook.dto.IngredientRequest;
import com.recipenotebook.dto.StepRequest;
import com.recipenotebook.entity.Category;
import com.recipenotebook.entity.Recipe;
import com.recipenotebook.repository.CategoryRepository;
import com.recipenotebook.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RecipeControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private RecipeRepository recipeRepository;
    
    private Long categoryId1;
    private Long categoryId2;
    
    @BeforeEach
    void setUp() {
        recipeRepository.deleteAll();
        
        Category category1 = categoryRepository.findByName("Dessert")
            .orElseGet(() -> categoryRepository.save(new Category(null, "Dessert", false)));
        Category category2 = categoryRepository.findByName("Quick & Easy")
            .orElseGet(() -> categoryRepository.save(new Category(null, "Quick & Easy", false)));
        
        categoryId1 = category1.getId();
        categoryId2 = category2.getId();
    }
    
    @Test
    void createRecipe_WithValidRequest_ReturnsCreated() throws Exception {
        CreateRecipeRequest request = createValidRequest();
        
        mockMvc.perform(post("/api/v1/recipes")
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Recipe created successfully"))
                .andExpect(jsonPath("$.data.recipeId").isNumber());
    }
    
    @Test
    void createRecipe_WithMissingTitle_ReturnsBadRequest() throws Exception {
        CreateRecipeRequest request = createValidRequest();
        request.setTitle("");
        
        mockMvc.perform(post("/api/v1/recipes")
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }
    
    @Test
    void createRecipe_WithInvalidDifficulty_ReturnsBadRequest() throws Exception {
        CreateRecipeRequest request = createValidRequest();
        request.setDifficulty("INVALID");
        
        mockMvc.perform(post("/api/v1/recipes")
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"));
    }
    
    @Test
    void createRecipe_WithLessThanTwoSteps_ReturnsBadRequest() throws Exception {
        CreateRecipeRequest request = createValidRequest();
        request.setSteps(Arrays.asList(
            new StepRequest("Only one step")
        ));
        
        mockMvc.perform(post("/api/v1/recipes")
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"));
    }
    
    @Test
    void createRecipe_WithNonExistentCategory_ReturnsNotFound() throws Exception {
        CreateRecipeRequest request = createValidRequest();
        request.setCategoryIds(Arrays.asList(999L));
        
        mockMvc.perform(post("/api/v1/recipes")
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Invalid category ID"));
    }
    
    @Test
    void updateRecipe_WithValidRequest_ReturnsOk() throws Exception {
        Long recipeId = createTestRecipe(1L);
        CreateRecipeRequest updateRequest = createValidRequest();
        updateRequest.setTitle("Updated Cookie Recipe");
        updateRequest.setCookingTimeMinutes(30);
        
        mockMvc.perform(put("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Recipe updated successfully"))
                .andExpect(jsonPath("$.data.recipeId").value(recipeId));
        
        Recipe updatedRecipe = recipeRepository.findById(recipeId).orElseThrow();
        assertThat(updatedRecipe.getTitle()).isEqualTo("Updated Cookie Recipe");
        assertThat(updatedRecipe.getCookingTimeMinutes()).isEqualTo(30);
    }
    
    @Test
    void updateRecipe_WithInvalidData_ReturnsBadRequest() throws Exception {
        Long recipeId = createTestRecipe(1L);
        CreateRecipeRequest updateRequest = createValidRequest();
        updateRequest.setTitle("");
        
        mockMvc.perform(put("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }
    
    @Test
    void updateRecipe_WithNonExistentRecipe_ReturnsNotFound() throws Exception {
        CreateRecipeRequest updateRequest = createValidRequest();
        
        mockMvc.perform(put("/api/v1/recipes/999")
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Recipe not found"));
    }
    
    @Test
    void updateRecipe_WithDifferentUser_ReturnsNotFound() throws Exception {
        Long recipeId = createTestRecipe(1L);
        CreateRecipeRequest updateRequest = createValidRequest();
        
        mockMvc.perform(put("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 2L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Recipe not found"));
    }
    
    @Test
    void updateRecipe_WithInvalidCategory_ReturnsNotFound() throws Exception {
        Long recipeId = createTestRecipe(1L);
        CreateRecipeRequest updateRequest = createValidRequest();
        updateRequest.setCategoryIds(Arrays.asList(999L));
        
        mockMvc.perform(put("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Invalid category ID"));
    }
    
    @Test
    void updateRecipe_ReplacesIngredientsAndSteps() throws Exception {
        Long recipeId = createTestRecipe(1L);
        CreateRecipeRequest updateRequest = createValidRequest();
        updateRequest.setIngredients(Arrays.asList(
            new IngredientRequest("3", "cups", "oats"),
            new IngredientRequest("2", "tbsp", "honey")
        ));
        updateRequest.setSteps(Arrays.asList(
            new StepRequest("New first step"),
            new StepRequest("New second step")
        ));
        
        mockMvc.perform(put("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());
        
        Recipe updatedRecipe = recipeRepository.findById(recipeId).orElseThrow();
        assertThat(updatedRecipe.getIngredients()).hasSize(2);
        assertThat(updatedRecipe.getIngredients().get(0).getName()).isEqualTo("oats");
        assertThat(updatedRecipe.getSteps()).hasSize(2);
        assertThat(updatedRecipe.getSteps().get(0).getInstruction()).isEqualTo("New first step");
    }
    
    private Long createTestRecipe(Long userId) throws Exception {
        CreateRecipeRequest request = createValidRequest();
        
        String response = mockMvc.perform(post("/api/v1/recipes")
                .header("X-User-Id", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        
        return objectMapper.readTree(response).get("data").get("recipeId").asLong();
    }
    
    private CreateRecipeRequest createValidRequest() {
        CreateRecipeRequest request = new CreateRecipeRequest();
        request.setTitle("Classic Chocolate Chip Cookies");
        request.setDifficulty("EASY");
        request.setCookingTimeMinutes(25);
        request.setCategoryIds(Arrays.asList(categoryId1, categoryId2));
        
        List<IngredientRequest> ingredients = Arrays.asList(
            new IngredientRequest("2", "cups", "all-purpose flour"),
            new IngredientRequest("1", "cup", "chocolate chips")
        );
        request.setIngredients(ingredients);
        
        List<StepRequest> steps = Arrays.asList(
            new StepRequest("Preheat oven to 375°F and line baking sheets with parchment paper."),
            new StepRequest("Mix flour and chocolate chips in a bowl until well combined."),
            new StepRequest("Bake for 10-12 minutes until golden brown.")
        );
        request.setSteps(steps);
        
        return request;
    }
    
    @Test
    void getRecipeById_WithValidRecipe_ReturnsOk() throws Exception {
        Long recipeId = createTestRecipe(1L);
        
        mockMvc.perform(get("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Recipe retrieved successfully"))
                .andExpect(jsonPath("$.data.id").value(recipeId))
                .andExpect(jsonPath("$.data.title").value("Classic Chocolate Chip Cookies"))
                .andExpect(jsonPath("$.data.difficulty").value("EASY"))
                .andExpect(jsonPath("$.data.cookingTimeMinutes").value(25))
                .andExpect(jsonPath("$.data.ingredients").isArray())
                .andExpect(jsonPath("$.data.ingredients.length()").value(2))
                .andExpect(jsonPath("$.data.steps").isArray())
                .andExpect(jsonPath("$.data.steps.length()").value(3))
                .andExpect(jsonPath("$.data.categories").isArray())
                .andExpect(jsonPath("$.data.categories.length()").value(2))
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.data.updatedAt").exists());
    }
    
    @Test
    void getRecipeById_VerifiesIngredientsSortedByOrder() throws Exception {
        Long recipeId = createTestRecipe(1L);
        
        mockMvc.perform(get("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ingredients[0].sortOrder").value(1))
                .andExpect(jsonPath("$.data.ingredients[0].name").value("all-purpose flour"))
                .andExpect(jsonPath("$.data.ingredients[0].quantity").value("2"))
                .andExpect(jsonPath("$.data.ingredients[0].unit").value("cups"))
                .andExpect(jsonPath("$.data.ingredients[1].sortOrder").value(2))
                .andExpect(jsonPath("$.data.ingredients[1].name").value("chocolate chips"));
    }
    
    @Test
    void getRecipeById_VerifiesStepsSortedByStepNumber() throws Exception {
        Long recipeId = createTestRecipe(1L);
        
        mockMvc.perform(get("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.steps[0].stepNumber").value(1))
                .andExpect(jsonPath("$.data.steps[0].instruction").value("Preheat oven to 375°F and line baking sheets with parchment paper."))
                .andExpect(jsonPath("$.data.steps[1].stepNumber").value(2))
                .andExpect(jsonPath("$.data.steps[2].stepNumber").value(3));
    }
    
    @Test
    void getRecipeById_WithNonExistentRecipe_ReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/recipes/99999")
                .header("X-User-Id", 1L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Recipe not found"));
    }
    
    @Test
    void getRecipeById_WithDifferentUserId_ReturnsNotFound() throws Exception {
        Long recipeId = createTestRecipe(1L);
        
        mockMvc.perform(get("/api/v1/recipes/" + recipeId)
                .header("X-User-Id", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Recipe not found"));
    }
}
