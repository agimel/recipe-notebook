package com.recipenotebook.service;

import com.recipenotebook.dto.RegisterRequest;
import com.recipenotebook.dto.RegisterResponse;
import com.recipenotebook.entity.Category;
import com.recipenotebook.entity.Difficulty;
import com.recipenotebook.entity.Recipe;
import com.recipenotebook.entity.User;
import com.recipenotebook.exception.RegistrationException;
import com.recipenotebook.exception.UsernameAlreadyExistsException;
import com.recipenotebook.repository.CategoryRepository;
import com.recipenotebook.repository.RecipeRepository;
import com.recipenotebook.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private CategoryRepository categoryRepository;
    
    @Mock
    private RecipeRepository recipeRepository;
    
    @Mock
    private BCryptPasswordEncoder passwordEncoder;
    
    @InjectMocks
    private AuthService authService;
    
    private RegisterRequest validRequest;
    
    @BeforeEach
    void setUp() {
        validRequest = new RegisterRequest();
        validRequest.setUsername("testuser");
        validRequest.setPassword("password123");
    }
    
    @Test
    void registerUser_WithValidData_ShouldSucceed() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        
        Category dessertCategory = new Category();
        dessertCategory.setId(4L);
        dessertCategory.setName("Dessert");
        when(categoryRepository.saveAll(anyList())).thenReturn(List.of(dessertCategory));
        
        Recipe savedRecipe = new Recipe();
        savedRecipe.setId(1L);
        when(recipeRepository.save(any(Recipe.class))).thenReturn(savedRecipe);
        
        RegisterResponse response = authService.registerUser(validRequest);
        
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("testuser");
        
        verify(userRepository).existsByUsername("testuser");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(categoryRepository).saveAll(anyList());
        verify(recipeRepository).save(any(Recipe.class));
    }
    
    @Test
    void registerUser_WithExistingUsername_ShouldThrowException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);
        
        assertThatThrownBy(() -> authService.registerUser(validRequest))
                .isInstanceOf(UsernameAlreadyExistsException.class)
                .hasMessageContaining("testuser");
        
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }
    
    @Test
    void registerUser_WithDatabaseError_ShouldThrowRegistrationException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class))).thenThrow(new DataAccessException("DB error") {});
        
        assertThatThrownBy(() -> authService.registerUser(validRequest))
                .isInstanceOf(RegistrationException.class)
                .hasMessageContaining("Database error");
        
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).save(any(User.class));
    }
    
    @Test
    void registerUser_ShouldHashPassword() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getPasswordHash()).isEqualTo("$2a$10$hashedPassword");
            return savedUser;
        });
        
        Category dessertCategory = new Category();
        dessertCategory.setId(4L);
        dessertCategory.setName("Dessert");
        when(categoryRepository.saveAll(anyList())).thenReturn(List.of(dessertCategory));
        when(recipeRepository.save(any(Recipe.class))).thenReturn(new Recipe());
        
        authService.registerUser(validRequest);
        
        verify(passwordEncoder).encode("password123");
    }
    
    @Test
    void registerUser_ShouldCreate6DefaultCategories() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        
        Category dessertCategory = new Category();
        dessertCategory.setName("Dessert");
        when(categoryRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<Category> categories = invocation.getArgument(0);
            assertThat(categories).hasSize(6);
            assertThat(categories).extracting(Category::getName)
                    .containsExactlyInAnyOrder("Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks");
            assertThat(categories).allMatch(cat -> cat.getIsDefault() == true);
            return categories;
        });
        
        when(recipeRepository.save(any(Recipe.class))).thenReturn(new Recipe());
        
        authService.registerUser(validRequest);
        
        verify(categoryRepository).saveAll(anyList());
    }
    
    @Test
    void registerUser_ShouldCreateSampleRecipe() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        
        Category dessertCategory = new Category();
        dessertCategory.setName("Dessert");
        when(categoryRepository.saveAll(anyList())).thenReturn(List.of(dessertCategory));
        
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(invocation -> {
            Recipe recipe = invocation.getArgument(0);
            assertThat(recipe.getUserId()).isEqualTo(1L);
            assertThat(recipe.getTitle()).isEqualTo("Classic Chocolate Chip Cookies");
            assertThat(recipe.getDifficulty()).isEqualTo(Difficulty.EASY);
            assertThat(recipe.getCookingTimeMinutes()).isEqualTo(25);
            assertThat(recipe.getIngredients()).hasSize(9);
            assertThat(recipe.getSteps()).hasSize(6);
            assertThat(recipe.getCategories()).hasSize(1);
            return recipe;
        });
        
        authService.registerUser(validRequest);
        
        verify(recipeRepository).save(any(Recipe.class));
    }
}
