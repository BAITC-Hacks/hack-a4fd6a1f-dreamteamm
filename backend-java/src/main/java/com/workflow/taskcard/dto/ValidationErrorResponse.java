package com.workflow.taskcard.dto;

import java.util.ArrayList;
import java.util.List;

public class ValidationErrorResponse {
    private List<FieldErrorDetail> errors = new ArrayList<>();

    public ValidationErrorResponse() {}

    public ValidationErrorResponse(List<FieldErrorDetail> errors) {
        this.errors = errors;
    }

    public List<FieldErrorDetail> getErrors() { return errors; }
    public void setErrors(List<FieldErrorDetail> errors) { this.errors = errors; }

    public static class FieldErrorDetail {
        private String field;
        private String message;

        public FieldErrorDetail() {}
        public FieldErrorDetail(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
