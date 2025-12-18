package com.recipenotebook.repository;

import com.recipenotebook.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long>, JpaSpecificationExecutor<Recipe> {
    
    @Query("SELECT r FROM Recipe r WHERE r.id = :recipeId AND r.userId = :userId")
    Optional<Recipe> findByIdAndUserId(@Param("recipeId") Long recipeId, @Param("userId") Long userId);
}
