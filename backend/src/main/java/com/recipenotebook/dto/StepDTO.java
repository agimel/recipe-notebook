package com.recipenotebook.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StepDTO {
    private Long id;
    private Integer stepNumber;
    private String instruction;
}
