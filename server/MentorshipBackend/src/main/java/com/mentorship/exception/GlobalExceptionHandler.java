package com.mentorship.exception;

import java.io.FileOutputStream;
import java.io.PrintStream;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        // Log to console
        System.err.println("GLOBAL EXCEPTION CAUGHT: " + e.getMessage());
        e.printStackTrace();

        // Log to file
        try {
            PrintStream ps = new PrintStream(new FileOutputStream("server_error.log", true)); // Append mode
            ps.println("----- EXCEPTION AT " + java.time.LocalDateTime.now() + " -----");
            e.printStackTrace(ps);
            ps.close();
        } catch (Exception ex) {
            System.err.println("Failed to write to log file: " + ex.getMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal Server Error: " + e.getMessage());
    }
}
