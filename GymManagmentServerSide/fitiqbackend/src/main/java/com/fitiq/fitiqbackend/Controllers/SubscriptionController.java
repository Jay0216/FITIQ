package com.fitiq.fitiqbackend.Controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.Subscription;
import com.fitiq.fitiqbackend.Services.SubscriptionService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Autowired
    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

@GetMapping("/member")
public ResponseEntity<?> getMemberSubscription(
        @RequestHeader("Authorization") String token) {

    // 🔐 Check token
    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    String jwt = token.substring(7);

    // 🔐 Validate token
    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    // 🔐 Only members can access
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("MEMBER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Member role required.");
    }

    // 🔐 Extract member ID from JWT
    String memberId = JWTConfig.extractUserId(jwt);

    // 🎯 Fetch subscription
    Subscription subscription = subscriptionService.getSubscriptionByMemberId(memberId);

    if (subscription == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No subscription found for this member");
    }

    return ResponseEntity.ok(subscription);
}

// Get total subscriptions count (Owner only)
@GetMapping("/count")
public ResponseEntity<?> getTotalSubscriptionsCount(
        @RequestHeader("Authorization") String token) {

    // 🔐 Check token
    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Missing or invalid token");
    }

    String jwt = token.substring(7);

    // 🔐 Validate token
    if (!JWTConfig.validateToken(jwt)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired token");
    }

    // 🔐 Only OWNER can access
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("OWNER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Owners only.");
    }

    long count = subscriptionService.countSubscriptions();

    return ResponseEntity.ok(Map.of(
            "totalSubscriptions", count
    ));
}
}