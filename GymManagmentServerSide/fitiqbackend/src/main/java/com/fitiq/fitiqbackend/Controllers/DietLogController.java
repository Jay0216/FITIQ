package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.DTO.DietLogAIRequest;
import com.fitiq.fitiqbackend.DTO.DietLogAIResponse;
import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.DietLog;
import com.fitiq.fitiqbackend.Services.DietLogAIService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.fitiq.fitiqbackend.Services.DietLogService;

@RestController
@RequestMapping("/api/member/diet-log")
@CrossOrigin
public class DietLogController {

    private final DietLogAIService dietLogAIService;
    private final DietLogService dietLogService;

    @Autowired
    public DietLogController(DietLogAIService dietLogAIService, DietLogService dietLogService) {
        this.dietLogAIService = dietLogAIService;
        this.dietLogService = dietLogService;
    }

    @PostMapping("/analyze-meal")
    public ResponseEntity<?> analyzeMeal(
            @RequestHeader("Authorization") String token,
            @RequestBody DietLogAIRequest request
    ) {

        // 1️⃣ Validate token
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid token");
        }

        String jwt = token.substring(7);

        if (!JWTConfig.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token");
        }

        // 2️⃣ Ensure MEMBER role
        String role = JWTConfig.extractRole(jwt);
        if (role == null || !role.equals("MEMBER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Member role required.");
        }

        // 3️⃣ Call AI
        DietLogAIResponse response = dietLogAIService.analyzeMeal(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveDietLog(
            @RequestHeader("Authorization") String token,
            @RequestBody DietLog dietLog
    ) {
        // 1️⃣ Validate token
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }
        String jwt = token.substring(7);
        if (!JWTConfig.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }

        // 2️⃣ Ensure MEMBER role
        String role = JWTConfig.extractRole(jwt);
        if (role == null || !role.equals("MEMBER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Member role required.");
        }

        // 3️⃣ Save diet log
        DietLog savedLog = dietLogService.saveDietLog(dietLog);

        return ResponseEntity.ok(savedLog);
    }

@GetMapping("/by-plan/{dietPlanId}")
public ResponseEntity<?> getDietLogsByPlan(
        @RequestHeader("Authorization") String token,
        @PathVariable("dietPlanId") String dietPlanId
) {
    // 1️⃣ Validate token
    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }
    String jwt = token.substring(7);
    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    // 2️⃣ Ensure MEMBER role
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("MEMBER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Member role required.");
    }

    // 3️⃣ Fetch logs
    try {
        var logs = dietLogService.getDietLogsByPlan(dietPlanId);
        return ResponseEntity.ok(logs);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch diet logs: " + e.getMessage());
    }
}
}