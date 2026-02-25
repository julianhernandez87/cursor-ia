package com.demo.exception;

import com.demo.config.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Single place for mapping exceptions to HTTP and logging. Controllers do not catch;
 * all exceptions bubble here so the API returns a consistent ErrorResponse with correlationId.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static ErrorResponse buildResponse(HttpServletRequest request, int status, String message,
                                                List<ErrorResponse.FieldError> errors) {
        String path = request != null ? request.getRequestURI() : null;
        String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
        return ErrorResponse.of(status, message, path, correlationId, errors);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                           HttpServletRequest request) {
        List<ErrorResponse.FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErrorResponse.FieldError(e.getField(), e.getDefaultMessage()))
                .collect(Collectors.toList());
        log.warn("Validation failed correlationId={} path={} fields={}",
                MDC.get(CorrelationIdFilter.MDC_KEY), request.getRequestURI(),
                errors.stream().map(ErrorResponse.FieldError::field).toList());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildResponse(request, 400, "Validation failed", errors));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex,
                                                              HttpServletRequest request) {
        log.warn("Authentication failed correlationId={} path={}", MDC.get(CorrelationIdFilter.MDC_KEY), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildResponse(request, 401, "Invalid credentials", null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                           HttpServletRequest request) {
        log.warn("Access denied correlationId={} path={}", MDC.get(CorrelationIdFilter.MDC_KEY), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildResponse(request, 403, "Access denied", null));
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        int status = ex.getStatus().value();
        log.warn("Business exception correlationId={} path={} status={} message={}",
                MDC.get(CorrelationIdFilter.MDC_KEY), request.getRequestURI(), status, ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(buildResponse(request, status, ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception correlationId={} path={}", MDC.get(CorrelationIdFilter.MDC_KEY), request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildResponse(request, 500, "Internal server error", null));
    }
}
