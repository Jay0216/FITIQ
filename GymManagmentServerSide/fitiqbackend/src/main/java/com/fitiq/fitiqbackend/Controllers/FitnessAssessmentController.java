package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.Models.FitnessAssessment;
import com.fitiq.fitiqbackend.Models.Trainer;
import com.fitiq.fitiqbackend.Services.FitnessAssessmentService;
import com.fitiq.fitiqbackend.Services.TrainerService;
import com.fitiq.fitiqbackend.JWT.JWTConfig; // Your JWT utility class
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fitness-assessments")
@CrossOrigin(origins = "*")
public class FitnessAssessmentController {

    private final FitnessAssessmentService assessmentService;
    private final TrainerService trainerService;

    @Autowired
    public FitnessAssessmentController(FitnessAssessmentService assessmentService, TrainerService trainerService) {
        this.assessmentService = assessmentService;
        this.trainerService = trainerService;
    }

    // Create a new fitness assessment for the logged-in member
    @PostMapping("/create")
    public ResponseEntity<?> createAssessment(@RequestHeader("Authorization") String token,
                                              @RequestBody FitnessAssessment assessment) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid token");
        }

        String jwt = token.substring(7); // remove "Bearer "
        if (!JWTConfig.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token");
        }

        String memberId = JWTConfig.extractUserId(jwt);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User ID not found in token");
        }

        // Set the memberId in the assessment before saving
        assessment.setMemberId(memberId);

        FitnessAssessment created = assessmentService.createAssessment(assessment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get all fitness assessments of the logged-in member
    @GetMapping("/member")
    public ResponseEntity<?> getMemberAssessments(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid token");
        }

        String jwt = token.substring(7);
        if (!JWTConfig.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token");
        }

        String memberId = JWTConfig.extractUserId(jwt);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User ID not found in token");
        }

        List<FitnessAssessment> assessments = assessmentService.getAssessmentsByMember(memberId);
        return ResponseEntity.ok(assessments);
    }

    // Activate a fitness assessment (freeze others)
@PutMapping("/activate/{assessmentId}")
public ResponseEntity<?> activateAssessment(@RequestHeader("Authorization") String token,
                                            @PathVariable String assessmentId) {

    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    String jwt = token.substring(7);

    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    String memberId = JWTConfig.extractUserId(jwt);

    if (memberId == null) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("User ID not found in token");
    }

    //assessmentService.activateAssessment(memberId, assessmentId);

    assessmentService.activateAssessment(assessmentId, memberId);

    return ResponseEntity.ok("Fitness assessment activated successfully");
}


// Get active fitness assessments filtered by trainer type
    @GetMapping("/active")
    public ResponseEntity<?> getAllActiveAssessments(
            @RequestHeader("Authorization") String token) {

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

        // Extract trainerId from JWT
        String trainerId = JWTConfig.extractUserId(jwt);

        // Fetch trainer from database
        Trainer trainer = trainerService.getTrainerById(trainerId);

        if (trainer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Trainer not found");
        }

        // Get trainer type from trainer entity
        String trainerType = trainer.getType();

        // Filter assessments
        List<FitnessAssessment> activeAssessments =
            assessmentService.getAssessmentsByFitnessGoal(trainerType);

        return ResponseEntity.ok(activeAssessments);
    }

    
}