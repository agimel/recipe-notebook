package com.recipenotebook.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDetailDTO {
    private Long id;
    private String title;
    private String difficulty;
    private Integer cookingTimeMinutes;
    private List<CategoryDTO> categories;
    private List<IngredientDTO> ingredients;
    private List<StepDTO> steps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
