package com.fitiq.fitiqbackend.Controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fitiq.fitiqbackend.DTO.TrainerLoginRequest;
import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.Trainer;
import com.fitiq.fitiqbackend.Services.TrainerService;

@RestController
@RequestMapping("/api/trainers")
@CrossOrigin(origins = "*")
public class TrainerAuthController {

    private final TrainerService trainerService;

    public TrainerAuthController(TrainerService trainerService) {
        this.trainerService = trainerService;
    }

    // Owner creates trainer account
    @PostMapping("/create")
    public ResponseEntity<?> createTrainer(@RequestBody Trainer trainer) {

        Trainer savedTrainer = trainerService.createTrainer(trainer);

        savedTrainer.setPassword(null);

        return ResponseEntity.ok(Map.of(
                "message", "Trainer account created",
                "trainer", savedTrainer
        ));
    }

    // Trainer login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody TrainerLoginRequest request) {

        Trainer trainer = trainerService.findByEmail(request.getEmail());

        if (trainer == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "Invalid email or password"
            ));
        }

        if (!trainer.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "Invalid email or password"
            ));
        }

        String token = JWTConfig.generateToken(trainer.getId(), "TRAINER");

        trainer.setPassword(null);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", token,
                "trainer", trainer
        ));
    }

    // Get all trainers (Member protected)
@GetMapping("/all")
public ResponseEntity<?> getAllTrainers(@RequestHeader("Authorization") String token) {

    // Remove "Bearer " prefix
    if (token.startsWith("Bearer ")) {
        token = token.substring(7);
    }

    // Validate token
    String role = JWTConfig.extractRole(token);

    if (role == null || !role.equals("MEMBER")) {
        return ResponseEntity.status(403).body(Map.of(
                "message", "Access denied. Members only."
        ));
    }

    // Fetch trainers
    var trainers = trainerService.getAllTrainers();

    // Hide passwords
    trainers.forEach(trainer -> trainer.setPassword(null));

    return ResponseEntity.ok(Map.of(
            "message", "Trainers fetched successfully",
            "trainers", trainers
    ));
}


@GetMapping("/allmembers")
public ResponseEntity<?> getAllTrainersforOwners(@RequestHeader("Authorization") String token) {

    // Remove "Bearer " prefix
    if (token.startsWith("Bearer ")) {
        token = token.substring(7);
    }

    // Validate token
    String role = JWTConfig.extractRole(token);

    if (role == null || !role.equals("OWNER")) {
        return ResponseEntity.status(403).body(Map.of(
                "message", "Access denied. Owners only."
        ));
    }

    // Fetch trainers
    var trainers = trainerService.getAllTrainers();

    // Hide passwords
    trainers.forEach(trainer -> trainer.setPassword(null));

    return ResponseEntity.ok(Map.of(
            "message", "Trainers fetched successfully",
            "trainers", trainers
    ));
}

// Get total trainers count
@GetMapping("/count")
public ResponseEntity<?> getTotalTrainersCount() {

    long count = trainerService.countTrainers();

    return ResponseEntity.ok(Map.of(
            "totalTrainers", count
    ));
}
}
