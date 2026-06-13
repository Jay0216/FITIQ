package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.WorkoutPlans;
import com.fitiq.fitiqbackend.Services.WorkoutPlanService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-plans")
@CrossOrigin(origins = "*")
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    @Autowired
    public WorkoutPlanController(WorkoutPlanService workoutPlanService) {
        this.workoutPlanService = workoutPlanService;
    }

    // Trainer creates workout plan
@PostMapping("/create")
public ResponseEntity<?> createWorkoutPlan(
        @RequestHeader("Authorization") String token,
        @RequestBody WorkoutPlans workoutPlan) {

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

    // Only TRAINER allowed
    if (role == null || !role.equals("TRAINER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Trainer role required.");
    }

    // Extract trainerId
    String trainerId = JWTConfig.extractUserId(jwt);

    // Attach trainerId to workout plan
    workoutPlan.setTrainerId(trainerId);

    WorkoutPlans createdPlan = workoutPlanService.createWorkoutPlan(workoutPlan);

    return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
}


// Get workout plans created by trainer
@GetMapping("/trainer")
public ResponseEntity<?> getTrainerPlans(
        @RequestHeader("Authorization") String token) {

    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    String jwt = token.substring(7);

    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    String role = JWTConfig.extractRole(jwt);

    if (role == null || !role.equals("TRAINER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Trainer role required.");
    }

    String trainerId = JWTConfig.extractUserId(jwt);

    List<WorkoutPlans> plans =
            workoutPlanService.getPlansByTrainer(trainerId);

    return ResponseEntity.ok(plans);
}


// Member fetch their workout plans
@GetMapping("/member/active")
public ResponseEntity<?> getMemberWorkoutPlans(
        @RequestHeader("Authorization") String token) {

    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    String jwt = token.substring(7);

    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    String role = JWTConfig.extractRole(jwt);

    if (role == null || !role.equals("MEMBER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Member role required.");
    }

    // Extract memberId
    String memberId = JWTConfig.extractUserId(jwt);

    // Fetch workout plans for this member
    List<WorkoutPlans> plans = workoutPlanService.getMemberWorkoutPlans(memberId);

    if (plans == null || plans.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No workout plan assigned to this member");
    }

    return ResponseEntity.ok(plans);
}

}
