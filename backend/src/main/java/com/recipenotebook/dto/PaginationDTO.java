package com.recipenotebook.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaginationDTO {
    private Integer currentPage;
    private Integer totalPages;
    private Long totalRecipes;
    private Integer pageSize;
    private Boolean hasNext;
    private Boolean hasPrevious;
}
