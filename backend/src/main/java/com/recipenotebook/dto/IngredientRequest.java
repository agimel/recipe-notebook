package com.recipenotebook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IngredientRequest {
    
    @NotBlank(message = "Quantity is required")
    @Size(max = 20, message = "Quantity must not exceed 20 characters")
    private String quantity;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;

    @NotBlank(message = "Ingredient name is required")
    @Size(max = 50, message = "Ingredient name must not exceed 50 characters")
    private String name;
}
