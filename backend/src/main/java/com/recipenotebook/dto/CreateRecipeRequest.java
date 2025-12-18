package com.recipenotebook.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateRecipeRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    @NotNull(message = "Difficulty is required")
    @Pattern(regexp = "^(EASY|MEDIUM|HARD)$", message = "Difficulty must be EASY, MEDIUM, or HARD")
    private String difficulty;

    @NotNull(message = "Cooking time is required")
    @Min(value = 1, message = "Cooking time must be at least 1 minute")
    private Integer cookingTimeMinutes;

    @NotEmpty(message = "At least one category is required")
    @Size(min = 1, message = "At least one category is required")
    private List<Long> categoryIds;

    @NotEmpty(message = "At least one ingredient is required")
    @Size(min = 1, message = "At least one ingredient is required")
    @Valid
    private List<IngredientRequest> ingredients;

    @NotEmpty(message = "At least two steps are required")
    @Size(min = 2, message = "At least two steps are required")
    @Valid
    private List<StepRequest> steps;
}
