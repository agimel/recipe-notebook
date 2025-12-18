package com.recipenotebook.service;

import com.recipenotebook.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFilterCriteria {
    private Long userId;
    private List<Long> categoryIds;
    private Difficulty difficulty;
    private String searchQuery;
    private int page;
    private int size;
    private String sortField;
    private String sortDirection;
}
