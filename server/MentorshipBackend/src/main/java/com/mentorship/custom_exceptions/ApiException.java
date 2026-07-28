package com.mentorship.custom_exceptions;

public class ApiException extends RuntimeException {
    public ApiException(String mesg) {
        super(mesg);
    }

    public ApiException(String mesg, Throwable cause) {
        super(mesg, cause);
    }
}
