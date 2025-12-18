package com.recipenotebook.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDTO {
    private Long id;
    private String quantity;
    private String unit;
    private String name;
    private Integer sortOrder;
}
