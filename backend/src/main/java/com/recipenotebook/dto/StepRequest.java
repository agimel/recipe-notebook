package com.recipenotebook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StepRequest {
    
    @NotBlank(message = "Instruction is required")
    @Size(min = 1, max = 500, message = "Instruction must be between 1 and 500 characters")
    private String instruction;
}
