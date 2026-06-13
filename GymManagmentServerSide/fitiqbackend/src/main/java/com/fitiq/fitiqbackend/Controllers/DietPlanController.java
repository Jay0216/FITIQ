package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.DTO.DietPlanAIRequest;
import com.fitiq.fitiqbackend.DTO.DietPlanAIResponse;
import com.fitiq.fitiqbackend.Services.DietPlanAIService;
import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.DietPlan;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fitiq.fitiqbackend.Services.DietPlanService;

@RestController
@RequestMapping("/api/trainer/diet-ai")
@CrossOrigin
public class DietPlanController {

    
    private final DietPlanAIService dietPlanAIService;
    private final DietPlanService dietPlanService;

    @Autowired
    public DietPlanController(DietPlanAIService dietPlanAIService, DietPlanService dietPlanService) {
        this.dietPlanAIService = dietPlanAIService;
        this.dietPlanService = dietPlanService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateDietPlan(
            @RequestHeader("Authorization") String token,
            @RequestBody DietPlanAIRequest request
    ) {

        // 1️⃣ Check Authorization header
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid token");
        }

        // 2️⃣ Extract JWT
        String jwt = token.substring(7);

        // 3️⃣ Validate Token
        if (!JWTConfig.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token");
        }

        // 4️⃣ Extract Role
        String role = JWTConfig.extractRole(jwt);

        if (role == null || !role.equals("TRAINER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Trainer role required.");
        }

        // 5️⃣ Extract Trainer ID (optional but useful for logs)
        String trainerId = JWTConfig.extractUserId(jwt);

        System.out.println("Trainer ID: " + trainerId);
        System.out.println("Generating AI diet plan...");

        // 6️⃣ Generate AI diet plan
        DietPlanAIResponse response = dietPlanAIService.generateDietPlan(request);

        return ResponseEntity.ok(response);
    }


@PostMapping("/save")
public ResponseEntity<?> saveDietPlan(
        @RequestHeader("Authorization") String token,
        @RequestBody DietPlan dietPlan
) {

    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    String jwt = token.substring(7);

    // Validate token
    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    // Extract role
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("TRAINER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Trainer role required.");
    }

    // Extract trainer ID from JWT
    String trainerId = JWTConfig.extractUserId(jwt); // <-- assuming you have a method to get userId from token
    if (trainerId == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid token: missing trainer ID");
    }

    // Set the trainerId in the diet plan before saving
    dietPlan.setTrainerId(trainerId);

    // Save the diet plan
    DietPlan savedPlan = dietPlanService.saveDietPlan(dietPlan);

    return ResponseEntity.status(HttpStatus.CREATED).body(savedPlan);
}

@GetMapping("/trainer-diet-plans/{assessmentId}")
public ResponseEntity<?> getDietPlansByAssessment(
        @RequestHeader("Authorization") String token,
        @PathVariable("assessmentId") String assessmentId
) {

    // 1️⃣ Check Authorization header
    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    // 2️⃣ Extract JWT
    String jwt = token.substring(7);

    // 3️⃣ Validate Token
    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    // 4️⃣ Extract Role
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("TRAINER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Trainer role required.");
    }

    // 5️⃣ Fetch diet plans by assessment ID
    List<DietPlan> dietPlans = dietPlanService.getDietPlansByAssessmentId(assessmentId);

    return ResponseEntity.ok(dietPlans);
}

@GetMapping("/my-diet-plans")
public ResponseEntity<?> getMyDietPlans(
        @RequestHeader("Authorization") String token
) {

    // 1️⃣ Check Authorization header
    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    // 2️⃣ Extract JWT
    String jwt = token.substring(7);

    // 3️⃣ Validate Token
    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    // 4️⃣ Extract Role (NOW MEMBER, not trainer)
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("MEMBER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Member role required.");
    }

    // 5️⃣ Extract MEMBER ID from JWT
    String memberId = JWTConfig.extractUserId(jwt);

    if (memberId == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid token: missing member ID");
    }

    // 6️⃣ Fetch diet plans for this member
    List<DietPlan> dietPlans = dietPlanService.getDietPlansByMemberId(memberId);

    return ResponseEntity.ok(dietPlans);
}

}