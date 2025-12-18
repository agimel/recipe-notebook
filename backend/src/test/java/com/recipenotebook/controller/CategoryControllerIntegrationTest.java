package com.recipenotebook.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipenotebook.dto.CategoriesResponseData;
import com.recipenotebook.dto.CategoryDTO;
import com.recipenotebook.entity.Category;
import com.recipenotebook.entity.User;
import com.recipenotebook.repository.CategoryRepository;
import com.recipenotebook.repository.UserRepository;
import com.recipenotebook.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CategoryControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private String jwtToken;
    private User testUser;
    
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPasswordHash(passwordEncoder.encode("password"));
        testUser = userRepository.save(testUser);
        
        jwtToken = jwtService.generateToken(testUser.getId(), testUser.getUsername());
        
        createDefaultCategoriesIfNotExist();
    }
    
    @Test
    void getCategories_WithValidToken_ShouldReturnCategories() throws Exception {
        String response = mockMvc.perform(get("/api/v1/categories")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Categories retrieved successfully"))
                .andExpect(jsonPath("$.data.categories").isArray())
                .andExpect(jsonPath("$.data.categories[0].id").exists())
                .andExpect(jsonPath("$.data.categories[0].name").exists())
                .andExpect(jsonPath("$.data.categories[0].isDefault").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CategoriesResponseData data = objectMapper.readTree(response)
                .get("data")
                .traverse(objectMapper)
                .readValueAs(CategoriesResponseData.class);
        
        assertThat(data.getCategories()).hasSizeGreaterThanOrEqualTo(6);
        
        List<String> categoryNames = data.getCategories().stream()
                .map(CategoryDTO::getName)
                .toList();
        
        assertThat(categoryNames).contains("Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks");
    }
    
    @Test
    void getCategories_CategoriesShouldBeSortedAlphabetically() throws Exception {
        String response = mockMvc.perform(get("/api/v1/categories")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CategoriesResponseData data = objectMapper.readTree(response)
                .get("data")
                .traverse(objectMapper)
                .readValueAs(CategoriesResponseData.class);
        
        List<String> categoryNames = data.getCategories().stream()
                .map(CategoryDTO::getName)
                .toList();
        
        List<String> sortedNames = categoryNames.stream()
                .sorted()
                .toList();
        
        assertThat(categoryNames).isEqualTo(sortedNames);
    }
    
    private void createDefaultCategoriesIfNotExist() {
        List<String> defaultCategoryNames = Arrays.asList(
                "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks"
        );
        
        for (String name : defaultCategoryNames) {
            if (categoryRepository.findByName(name).isEmpty()) {
                Category category = new Category();
                category.setName(name);
                category.setIsDefault(true);
                categoryRepository.save(category);
            }
        }
    }
}
