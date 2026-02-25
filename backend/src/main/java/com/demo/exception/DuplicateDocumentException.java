package com.demo.exception;

import org.springframework.http.HttpStatus;

public class DuplicateDocumentException extends BaseException {

    public DuplicateDocumentException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
