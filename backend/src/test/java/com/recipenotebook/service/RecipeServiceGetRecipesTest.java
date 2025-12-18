package com.recipenotebook.service;

import com.recipenotebook.dto.PaginationDTO;
import com.recipenotebook.dto.RecipeListResponseData;
import com.recipenotebook.dto.RecipeSummaryDTO;
import com.recipenotebook.entity.Category;
import com.recipenotebook.entity.Difficulty;
import com.recipenotebook.entity.Recipe;
import com.recipenotebook.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceGetRecipesTest {
    
    @Mock
    private RecipeRepository recipeRepository;
    
    @InjectMocks
    private RecipeService recipeService;
    
    private Recipe recipe1;
    private Recipe recipe2;
    private Category category1;
    private Category category2;
    
    @BeforeEach
    void setUp() {
        category1 = new Category();
        category1.setId(1L);
        category1.setName("Breakfast");
        category1.setIsDefault(true);
        
        category2 = new Category();
        category2.setId(2L);
        category2.setName("Dessert");
        category2.setIsDefault(true);
        
        recipe1 = new Recipe();
        recipe1.setId(1L);
        recipe1.setUserId(100L);
        recipe1.setTitle("Pancakes");
        recipe1.setDifficulty(Difficulty.EASY);
        recipe1.setCookingTimeMinutes(15);
        recipe1.setCategories(Arrays.asList(category1));
        recipe1.setCreatedAt(LocalDateTime.now().minusDays(2));
        recipe1.setUpdatedAt(LocalDateTime.now().minusDays(2));
        
        recipe2 = new Recipe();
        recipe2.setId(2L);
        recipe2.setUserId(100L);
        recipe2.setTitle("Chocolate Cake");
        recipe2.setDifficulty(Difficulty.MEDIUM);
        recipe2.setCookingTimeMinutes(60);
        recipe2.setCategories(Arrays.asList(category2));
        recipe2.setCreatedAt(LocalDateTime.now().minusDays(1));
        recipe2.setUpdatedAt(LocalDateTime.now().minusDays(1));
    }
    
    @Test
    void testGetRecipes_DefaultPagination() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("title");
        criteria.setSortDirection("asc");
        
        List<Recipe> recipes = Arrays.asList(recipe1, recipe2);
        Page<Recipe> recipePage = new PageImpl<>(recipes, 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "title")), 2);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(2, result.getRecipes().size());
        assertEquals("Pancakes", result.getRecipes().get(0).getTitle());
        assertEquals("Chocolate Cake", result.getRecipes().get(1).getTitle());
        
        PaginationDTO pagination = result.getPagination();
        assertEquals(0, pagination.getCurrentPage());
        assertEquals(1, pagination.getTotalPages());
        assertEquals(2L, pagination.getTotalRecipes());
        assertEquals(20, pagination.getPageSize());
        assertFalse(pagination.getHasNext());
        assertFalse(pagination.getHasPrevious());
        
        verify(recipeRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
    }
    
    @Test
    void testGetRecipes_WithCategoryFilter() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setCategoryIds(Arrays.asList(1L));
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("title");
        criteria.setSortDirection("asc");
        
        List<Recipe> recipes = Arrays.asList(recipe1);
        Page<Recipe> recipePage = new PageImpl<>(recipes, 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "title")), 1);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(1, result.getRecipes().size());
        assertEquals("Pancakes", result.getRecipes().get(0).getTitle());
        assertEquals(1, result.getRecipes().get(0).getCategories().size());
        assertEquals("Breakfast", result.getRecipes().get(0).getCategories().get(0).getName());
    }
    
    @Test
    void testGetRecipes_WithDifficultyFilter() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setDifficulty(Difficulty.EASY);
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("title");
        criteria.setSortDirection("asc");
        
        List<Recipe> recipes = Arrays.asList(recipe1);
        Page<Recipe> recipePage = new PageImpl<>(recipes, 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "title")), 1);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(1, result.getRecipes().size());
        assertEquals("EASY", result.getRecipes().get(0).getDifficulty());
    }
    
    @Test
    void testGetRecipes_WithSearchQuery() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setSearchQuery("chocolate");
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("title");
        criteria.setSortDirection("asc");
        
        List<Recipe> recipes = Arrays.asList(recipe2);
        Page<Recipe> recipePage = new PageImpl<>(recipes, 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "title")), 1);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(1, result.getRecipes().size());
        assertTrue(result.getRecipes().get(0).getTitle().toLowerCase().contains("chocolate"));
    }
    
    @Test
    void testGetRecipes_WithCombinedFilters() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setCategoryIds(Arrays.asList(2L));
        criteria.setDifficulty(Difficulty.MEDIUM);
        criteria.setSearchQuery("cake");
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("cookingTimeMinutes");
        criteria.setSortDirection("desc");
        
        List<Recipe> recipes = Arrays.asList(recipe2);
        Page<Recipe> recipePage = new PageImpl<>(recipes, 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "cookingTimeMinutes")), 1);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(1, result.getRecipes().size());
        assertEquals("Chocolate Cake", result.getRecipes().get(0).getTitle());
    }
    
    @Test
    void testGetRecipes_SortByCreatedAtDescending() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("createdAt");
        criteria.setSortDirection("desc");
        
        List<Recipe> recipes = Arrays.asList(recipe2, recipe1);
        Page<Recipe> recipePage = new PageImpl<>(recipes, 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")), 2);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(2, result.getRecipes().size());
        assertEquals("Chocolate Cake", result.getRecipes().get(0).getTitle());
        assertEquals("Pancakes", result.getRecipes().get(1).getTitle());
    }
    
    @Test
    void testGetRecipes_EmptyResults() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setSearchQuery("nonexistent");
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("title");
        criteria.setSortDirection("asc");
        
        Page<Recipe> recipePage = new PageImpl<>(new ArrayList<>(), 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "title")), 0);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(0, result.getRecipes().size());
        assertEquals(0, result.getPagination().getTotalPages());
        assertEquals(0L, result.getPagination().getTotalRecipes());
        assertFalse(result.getPagination().getHasNext());
        assertFalse(result.getPagination().getHasPrevious());
    }
    
    @Test
    void testGetRecipes_SecondPage() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(100L);
        criteria.setPage(1);
        criteria.setSize(1);
        criteria.setSortField("title");
        criteria.setSortDirection("asc");
        
        List<Recipe> recipes = Arrays.asList(recipe2);
        Page<Recipe> recipePage = new PageImpl<>(recipes, 
            PageRequest.of(1, 1, Sort.by(Sort.Direction.ASC, "title")), 2);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(1, result.getRecipes().size());
        
        PaginationDTO pagination = result.getPagination();
        assertEquals(1, pagination.getCurrentPage());
        assertEquals(2, pagination.getTotalPages());
        assertTrue(pagination.getHasPrevious());
        assertFalse(pagination.getHasNext());
    }
    
    @Test
    void testGetRecipes_UserIsolation() {
        RecipeFilterCriteria criteria = new RecipeFilterCriteria();
        criteria.setUserId(200L);
        criteria.setPage(0);
        criteria.setSize(20);
        criteria.setSortField("title");
        criteria.setSortDirection("asc");
        
        Page<Recipe> recipePage = new PageImpl<>(new ArrayList<>(), 
            PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "title")), 0);
        
        when(recipeRepository.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(recipePage);
        
        RecipeListResponseData result = recipeService.getRecipes(criteria);
        
        assertNotNull(result);
        assertEquals(0, result.getRecipes().size());
        verify(recipeRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
    }
}
