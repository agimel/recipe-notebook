package com.recipenotebook.service;

import com.recipenotebook.dto.RegisterRequest;
import com.recipenotebook.dto.RegisterResponse;
import com.recipenotebook.entity.*;
import com.recipenotebook.exception.RegistrationException;
import com.recipenotebook.exception.UsernameAlreadyExistsException;
import com.recipenotebook.repository.CategoryRepository;
import com.recipenotebook.repository.RecipeRepository;
import com.recipenotebook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final RecipeRepository recipeRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    @Transactional
    public RegisterResponse registerUser(RegisterRequest request) {
        log.info("Registration attempt for username: {}", request.getUsername());
        
        try {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new UsernameAlreadyExistsException(request.getUsername());
            }
            
            String passwordHash = passwordEncoder.encode(request.getPassword());
            
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPasswordHash(passwordHash);
            user = userRepository.save(user);
            
            log.info("User created successfully with ID: {}", user.getId());
            
            List<Category> defaultCategories = createDefaultCategories();
            
            Category dessertCategory = defaultCategories.stream()
                    .filter(cat -> "Dessert".equals(cat.getName()))
                    .findFirst()
                    .orElseThrow(() -> new RegistrationException("Dessert category not found"));
            
            createSampleRecipe(user.getId(), dessertCategory);
            
            log.info("Registration completed successfully for user: {}", user.getUsername());
            
            return new RegisterResponse(user.getId(), user.getUsername());
            
        } catch (UsernameAlreadyExistsException e) {
            throw e;
        } catch (DataAccessException e) {
            log.error("Database error during registration for username: {}", request.getUsername(), e);
            throw new RegistrationException("Database error occurred during registration", e);
        } catch (Exception e) {
            log.error("Unexpected error during registration for username: {}", request.getUsername(), e);
            throw new RegistrationException("An unexpected error occurred during registration", e);
        }
    }
    
    private List<Category> createDefaultCategories() {
        String[] categoryNames = {"Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks"};
        List<Category> categories = new ArrayList<>();
        
        for (String name : categoryNames) {
            Category category = new Category();
            category.setName(name);
            category.setIsDefault(true);
            categories.add(category);
        }
        
        List<Category> savedCategories = categoryRepository.saveAll(categories);
        log.info("Created {} default categories", savedCategories.size());
        
        return savedCategories;
    }
    
    private void createSampleRecipe(Long userId, Category dessertCategory) {
        Recipe recipe = new Recipe();
        recipe.setUserId(userId);
        recipe.setTitle("Classic Chocolate Chip Cookies");
        recipe.setDifficulty(Difficulty.EASY);
        recipe.setCookingTimeMinutes(25);
        
        addIngredients(recipe);
        addSteps(recipe);
        
        recipe.addCategory(dessertCategory);
        
        recipeRepository.save(recipe);
        log.info("Created sample recipe for user ID: {}", userId);
    }
    
    private void addIngredients(Recipe recipe) {
        String[][] ingredientData = {
            {"2¼", "cups", "all-purpose flour"},
            {"1", "tsp", "baking soda"},
            {"1", "tsp", "salt"},
            {"1", "cup", "butter, softened"},
            {"¾", "cup", "granulated sugar"},
            {"¾", "cup", "packed brown sugar"},
            {"2", "large", "eggs"},
            {"2", "tsp", "vanilla extract"},
            {"2", "cups", "chocolate chips"}
        };
        
        for (int i = 0; i < ingredientData.length; i++) {
            Ingredient ingredient = new Ingredient();
            ingredient.setQuantity(ingredientData[i][0]);
            ingredient.setUnit(ingredientData[i][1]);
            ingredient.setName(ingredientData[i][2]);
            ingredient.setSortOrder(i + 1);
            recipe.addIngredient(ingredient);
        }
    }
    
    private void addSteps(Recipe recipe) {
        String[] instructions = {
            "Preheat oven to 375°F (190°C).",
            "Combine flour, baking soda, and salt in a bowl.",
            "Beat butter and sugars until creamy. Add eggs and vanilla.",
            "Gradually blend in flour mixture. Stir in chocolate chips.",
            "Drop rounded tablespoons onto ungreased baking sheets.",
            "Bake for 9-11 minutes or until golden brown."
        };
        
        for (int i = 0; i < instructions.length; i++) {
            Step step = new Step();
            step.setStepNumber(i + 1);
            step.setInstruction(instructions[i]);
            recipe.addStep(step);
        }
    }
}
