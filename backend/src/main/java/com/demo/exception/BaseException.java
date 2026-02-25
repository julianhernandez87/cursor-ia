package com.demo.exception;

import org.springframework.http.HttpStatus;

/**
 * Base for domain exceptions. Carries HTTP status so GlobalExceptionHandler
 * can map 1:1 without branching on exception type.
 */
public abstract class BaseException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    protected BaseException(HttpStatus status, String message) {
        this(status, null, message);
    }

    protected BaseException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
