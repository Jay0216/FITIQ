package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.Models.Owner;
import com.fitiq.fitiqbackend.Services.OwnerService;
import com.fitiq.fitiqbackend.JWT.JWTConfig;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/owner/auth")
@CrossOrigin(origins = "*")
public class OwnerAuthController {

    @Autowired
    private OwnerService ownerService;

    // ✅ Register Owner (use only for testing or internal setup)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Owner owner) {

        try {
            Owner createdOwner = ownerService.createOwner(owner);

            createdOwner.setPassword(null); // hide password

            return ResponseEntity.ok(Map.of(
                    "message", "Owner registered successfully",
                    "owner", createdOwner
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    // ✅ Login Owner
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");
            String password = request.get("password");

            Owner owner = ownerService.login(email, password);

            // 🔐 Generate JWT
            String token = JWTConfig.generateToken(owner.getId(), "OWNER");

            owner.setPassword(null);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "owner", owner
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "Invalid email or password"
            ));
        }
    }
}
