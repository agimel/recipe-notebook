package com.recipenotebook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
    
    @Column(nullable = false, length = 20)
    private String quantity;
    
    @Column(nullable = false, length = 20)
    private String unit;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
