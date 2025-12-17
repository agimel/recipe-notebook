package com.recipenotebook.service;

import com.recipenotebook.dto.LoginResponseDTO;
import com.recipenotebook.dto.RegisterRequest;
import com.recipenotebook.dto.RegisterResponse;
import com.recipenotebook.entity.Category;
import com.recipenotebook.entity.Difficulty;
import com.recipenotebook.entity.Recipe;
import com.recipenotebook.entity.User;
import com.recipenotebook.exception.AuthenticationException;
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

import java.time.Instant;
import java.util.List;
import java.util.Optional;

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
    
    @Mock
    private JwtService jwtService;
    
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
        dessertCategory.setId(4L);
        dessertCategory.setName("Dessert");
        when(categoryRepository.findByName("Dessert")).thenReturn(java.util.Optional.of(dessertCategory));
        when(categoryRepository.findByName(anyString())).thenReturn(java.util.Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category cat = invocation.getArgument(0);
            if (cat.getId() == null) {
                cat.setId((long) (Math.random() * 1000));
            }
            return cat;
        });
        
        when(recipeRepository.save(any(Recipe.class))).thenReturn(new Recipe());
        
        authService.registerUser(validRequest);
        
        verify(categoryRepository, atLeast(6)).save(any(Category.class));
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
        dessertCategory.setId(4L);
        dessertCategory.setName("Dessert");
        when(categoryRepository.findByName("Dessert")).thenReturn(java.util.Optional.of(dessertCategory));
        when(categoryRepository.findByName(anyString())).thenReturn(java.util.Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category cat = invocation.getArgument(0);
            if (cat.getId() == null) {
                cat.setId((long) (Math.random() * 1000));
            }
            return cat;
        });
        
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
    
    @Test
    void login_WithValidCredentials_ShouldReturnLoginResponse() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPasswordHash("$2a$10$hashedPassword");
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$10$hashedPassword")).thenReturn(true);
        when(jwtService.generateToken(1L, "testuser")).thenReturn("mock.jwt.token");
        when(jwtService.getExpirationTime()).thenReturn(Instant.parse("2025-12-18T15:30:00Z"));
        
        LoginResponseDTO response = authService.login("testuser", "password123");
        
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getExpiresAt()).isEqualTo("2025-12-18T15:30:00Z");
        
        verify(userRepository).findByUsername("testuser");
        verify(passwordEncoder).matches("password123", "$2a$10$hashedPassword");
        verify(jwtService).generateToken(1L, "testuser");
        verify(jwtService).getExpirationTime();
    }
    
    @Test
    void login_WithNonExistentUsername_ShouldThrowAuthenticationException() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        
        assertThatThrownBy(() -> authService.login("nonexistent", "password123"))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("Invalid credentials");
        
        verify(userRepository).findByUsername("nonexistent");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(any(), anyString());
    }
    
    @Test
    void login_WithIncorrectPassword_ShouldThrowAuthenticationException() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPasswordHash("$2a$10$hashedPassword");
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashedPassword")).thenReturn(false);
        
        assertThatThrownBy(() -> authService.login("testuser", "wrongpassword"))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("Invalid credentials");
        
        verify(userRepository).findByUsername("testuser");
        verify(passwordEncoder).matches("wrongpassword", "$2a$10$hashedPassword");
        verify(jwtService, never()).generateToken(any(), anyString());
    }
    
    @Test
    void login_ShouldNotRevealWhetherUsernameExists() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        
        User user = new User();
        user.setUsername("existinguser");
        user.setPasswordHash("$2a$10$hashedPassword");
        when(userRepository.findByUsername("existinguser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashedPassword")).thenReturn(false);
        
        String messageForNonExistent = null;
        String messageForWrongPassword = null;
        
        try {
            authService.login("nonexistent", "password123");
        } catch (AuthenticationException e) {
            messageForNonExistent = e.getMessage();
        }
        
        try {
            authService.login("existinguser", "wrongpassword");
        } catch (AuthenticationException e) {
            messageForWrongPassword = e.getMessage();
        }
        
        assertThat(messageForNonExistent).isEqualTo(messageForWrongPassword);
    }
}
