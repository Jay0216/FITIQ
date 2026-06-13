package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.DTO.FingerprintEnrollRequest;
import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.Member;
import com.fitiq.fitiqbackend.Repository.MemberRepository;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/fingerprint")
@CrossOrigin(origins = "*")
public class MemberFingerprintEnrollController {

    private final MemberRepository memberRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    // ESP32 endpoint
    private final String ESP32_URL = "http://doorlock.local/fingerprint/enroll";

    public MemberFingerprintEnrollController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enrollFingerprint(
            @RequestHeader("Authorization") String token,
            @RequestBody FingerprintEnrollRequest request) {

        // ================= JWT CHECK =================
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

        if (role == null ||
                (!role.equals("TRAINER") && !role.equals("ADMIN"))) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Trainer or Admin role required.");
        }

        // ================= FIND MEMBER =================
        Member member = memberRepository.findByMembershipId(request.getMembershipId())
                .orElse(null);

        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Member not found");
        }

        try {

            // ================= CALL ESP32 =================
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // send membershipId to ESP32
            String body = "{ \"membershipId\": \"" + request.getMembershipId() + "\" }";

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ESP32_URL,
                    entity,
                    Map.class
            );

            // ================= GET FINGERPRINT ID =================
            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null || responseBody.get("fingerprintId") == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("ESP32 did not return fingerprint ID");
            }

            Integer fingerprintId = (Integer) responseBody.get("fingerprintId");

            // ================= SAVE TO DB =================
            member.setFingerprintId(fingerprintId);
            memberRepository.save(member);

            return ResponseEntity.ok(member);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("ESP32 enrollment failed: " + e.getMessage());
        }
    }
}