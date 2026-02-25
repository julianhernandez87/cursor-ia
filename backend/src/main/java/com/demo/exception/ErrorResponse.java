package com.demo.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Standardized API error body. Single contract for all errors; clients and OpenAPI rely on this shape.
 * Correlation ID supports production observability and traceability.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String message,
        int status,
        String path,
        String correlationId,
        String timestamp,
        List<FieldError> errors
) {

    public record FieldError(String field, String message) {}

    /**
     * Builds an ErrorResponse with correlationId and path from MDC/request; timestamp in ISO-8601.
     */
    public static ErrorResponse of(int status, String message, String path, String correlationId, List<FieldError> errors) {
        return new ErrorResponse(
                message,
                status,
                path,
                correlationId,
                Instant.now().toString(),
                errors
        );
    }
}
