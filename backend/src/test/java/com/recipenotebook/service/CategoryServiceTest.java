package com.recipenotebook.service;

import com.recipenotebook.dto.CategoriesResponseData;
import com.recipenotebook.dto.CategoryDTO;
import com.recipenotebook.entity.Category;
import com.recipenotebook.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {
    
    @Mock
    private CategoryRepository categoryRepository;
    
    @InjectMocks
    private CategoryService categoryService;
    
    private List<Category> testCategories;
    
    @BeforeEach
    void setUp() {
        testCategories = Arrays.asList(
            createCategory(1L, "Breakfast", true),
            createCategory(2L, "Dessert", true),
            createCategory(3L, "Dinner", true),
            createCategory(4L, "Drinks", true),
            createCategory(5L, "Lunch", true),
            createCategory(6L, "Snacks", true)
        );
    }
    
    @Test
    void getAllCategories_ShouldReturnAllCategoriesSortedByName() {
        when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(testCategories);
        
        CategoriesResponseData result = categoryService.getAllCategories();
        
        assertThat(result).isNotNull();
        assertThat(result.getCategories()).hasSize(6);
        
        List<CategoryDTO> categories = result.getCategories();
        assertThat(categories.get(0).getName()).isEqualTo("Breakfast");
        assertThat(categories.get(1).getName()).isEqualTo("Dessert");
        assertThat(categories.get(2).getName()).isEqualTo("Dinner");
        assertThat(categories.get(3).getName()).isEqualTo("Drinks");
        assertThat(categories.get(4).getName()).isEqualTo("Lunch");
        assertThat(categories.get(5).getName()).isEqualTo("Snacks");
        
        categories.forEach(category -> {
            assertThat(category.getId()).isNotNull();
            assertThat(category.getName()).isNotNull();
            assertThat(category.getIsDefault()).isTrue();
        });
        
        verify(categoryRepository).findAllByOrderByNameAsc();
    }
    
    @Test
    void getAllCategories_ShouldMapEntityFieldsCorrectly() {
        when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(testCategories);
        
        CategoriesResponseData result = categoryService.getAllCategories();
        
        CategoryDTO firstCategory = result.getCategories().get(0);
        assertThat(firstCategory.getId()).isEqualTo(1L);
        assertThat(firstCategory.getName()).isEqualTo("Breakfast");
        assertThat(firstCategory.getIsDefault()).isTrue();
    }
    
    @Test
    void getAllCategories_WhenNoCategoriesExist_ShouldReturnEmptyList() {
        when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(Arrays.asList());
        
        CategoriesResponseData result = categoryService.getAllCategories();
        
        assertThat(result).isNotNull();
        assertThat(result.getCategories()).isEmpty();
        verify(categoryRepository).findAllByOrderByNameAsc();
    }
    
    private Category createCategory(Long id, String name, Boolean isDefault) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setIsDefault(isDefault);
        return category;
    }
}
