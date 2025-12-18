package com.recipenotebook.exception;

import lombok.Getter;

import java.util.Map;

@Getter
public class QueryParameterValidationException extends RuntimeException {
    private final Map<String, String> errors;
    
    public QueryParameterValidationException(Map<String, String> errors) {
        super("Query parameter validation failed");
        this.errors = errors;
    }
}
