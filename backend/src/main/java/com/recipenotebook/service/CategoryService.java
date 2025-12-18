package com.recipenotebook.service;

import com.recipenotebook.dto.CategoriesResponseData;
import com.recipenotebook.dto.CategoryDTO;
import com.recipenotebook.entity.Category;
import com.recipenotebook.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public CategoriesResponseData getAllCategories() {
        log.info("Retrieving all categories");
        
        List<Category> categories = categoryRepository.findAllByOrderByNameAsc();
        
        List<CategoryDTO> categoryDTOs = categories.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        log.info("Retrieved {} categories", categoryDTOs.size());
        
        return new CategoriesResponseData(categoryDTOs);
    }
    
    private CategoryDTO mapToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setIsDefault(category.getIsDefault());
        return dto;
    }
}
