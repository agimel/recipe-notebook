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
public class RecipeSummaryDTO {
    private Long id;
    private String title;
    private String difficulty;
    private Integer cookingTimeMinutes;
    private List<CategoryDTO> categories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
