package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.DailySessions;
import com.fitiq.fitiqbackend.Services.DailySessionsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/daily-sessions")
@CrossOrigin(origins = "*")
public class DailySessionsController {

    private final DailySessionsService dailySessionsService;

    @Autowired
    public DailySessionsController(DailySessionsService dailySessionsService) {
        this.dailySessionsService = dailySessionsService;
    }

    // ── Create Daily Session
    @PostMapping("/create")
    public ResponseEntity<?> createDailySession(
            @RequestHeader("Authorization") String token,
            @RequestBody DailySessions session) {

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

        // Optional: you can attach trainerId to session if needed
        // session.setTrainerId(trainerId); // if DailySessions had a trainerId

        DailySessions createdSession = dailySessionsService.createSession(session);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
    }

    // ── Get Daily Sessions for Logged-in Member
@GetMapping("/member")
public ResponseEntity<?> getMemberDailySessions(
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

    // Extract memberId from token
    String memberId = JWTConfig.extractUserId(jwt);

    List<DailySessions> sessions =
            dailySessionsService.getSessionsByMemberId(memberId);

    return ResponseEntity.ok(sessions);
}


// ── Trainer Get Sessions for a Specific Member
@GetMapping("/trainer/member/{memberId}")
public ResponseEntity<?> getTrainerMemberSessions(
        @RequestHeader("Authorization") String token,
        @PathVariable("memberId") String memberId) {

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

    List<DailySessions> sessions =
            dailySessionsService.getSessionsByMemberId(memberId);

    return ResponseEntity.ok(sessions);
}


// ── Get Daily Sessions by Plan ID (Member)
@GetMapping("/plan/{planId}")
public ResponseEntity<?> getSessionsByPlan(
        @RequestHeader("Authorization") String token,
        @PathVariable("planId") String planId) {

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

    // Only MEMBER allowed
    if (role == null || !role.equals("MEMBER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Member role required.");
    }

    List<DailySessions> sessions = dailySessionsService.getByPlan(planId);

    return ResponseEntity.ok(sessions);
}



    
}
