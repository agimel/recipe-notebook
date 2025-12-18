package com.recipenotebook.repository;

import com.recipenotebook.entity.Category;
import com.recipenotebook.entity.Difficulty;
import com.recipenotebook.entity.Recipe;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class RecipeSpecification {
    
    public static Specification<Recipe> hasUserId(Long userId) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("userId"), userId);
    }
    
    public static Specification<Recipe> hasCategoryIds(List<Long> categoryIds) {
        return (root, query, criteriaBuilder) -> {
            if (categoryIds == null || categoryIds.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            
            Join<Recipe, Category> categoryJoin = root.join("categories", JoinType.LEFT);
            return categoryJoin.get("id").in(categoryIds);
        };
    }
    
    public static Specification<Recipe> hasDifficulty(Difficulty difficulty) {
        return (root, query, criteriaBuilder) -> {
            if (difficulty == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("difficulty"), difficulty);
        };
    }
    
    public static Specification<Recipe> titleContains(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + search.toLowerCase().trim() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
        };
    }
}
