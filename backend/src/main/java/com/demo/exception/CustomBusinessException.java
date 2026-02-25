package com.demo.exception;

import org.springframework.http.HttpStatus;

/**
 * Generic business rule violation for cases that do not have a dedicated exception.
 */
public class CustomBusinessException extends BaseException {

    public CustomBusinessException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }

    public CustomBusinessException(HttpStatus status, String message) {
        super(status, message);
    }
}
