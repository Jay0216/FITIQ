package com.fitiq.fitiqbackend.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.Appointments;
import com.fitiq.fitiqbackend.Services.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {


        private final AppointmentService appointmentService;


        @Autowired
        public AppointmentController(AppointmentService appointmentService) {
            this.appointmentService = appointmentService;
        }   
    

@PostMapping("/book")
public ResponseEntity<?> bookAppointment(
        @RequestHeader("Authorization") String token,
        @RequestBody Appointments appointment) {

    // 🔐 Check token exists
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

    // 🔐 Check role (ONLY MEMBER can book)
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("MEMBER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Member role required.");
    }

    // 🔐 Get member ID from token
    String memberId = JWTConfig.extractUserId(jwt);

    appointment.setMemberId(memberId);

    

    // 🎯 Create appointment
    Appointments createdAppointment = appointmentService.createAppointment(appointment);

    return ResponseEntity.status(HttpStatus.CREATED).body(createdAppointment);
}

// ─── NEW: Fetch all appointments for the logged-in member
    @GetMapping("/member")
    public ResponseEntity<?> getMemberAppointments(
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

        String memberId = JWTConfig.extractUserId(jwt);

        List<Appointments> appointments = appointmentService.getAppointmentsByMember(memberId);

        return ResponseEntity.ok(appointments);
    }

@GetMapping("/trainer")
public ResponseEntity<?> getTrainerAppointments(
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

    // 🔐 Only trainers can access
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("TRAINER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Trainer role required.");
    }

    // 🔐 Extract trainer ID directly from JWT
    String trainerId = JWTConfig.extractUserId(jwt);

    // 🎯 Fetch appointments for this trainer
    List<Appointments> appointments = appointmentService.getAppointmentsByTrainer(trainerId);

    return ResponseEntity.ok(appointments);
}


// ─── UPDATE APPOINTMENT STATUS ──────────────────────────────
@PutMapping("/update-status")
public ResponseEntity<?> updateAppointmentStatus(
        @RequestHeader("Authorization") String token,
        @RequestBody Appointments appointment) {

    // 🔐 Check token exists
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

    // 🔐 Only trainers can update appointment status
    String role = JWTConfig.extractRole(jwt);
    if (role == null || !role.equals("TRAINER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Trainer role required.");
    }

    // 🔐 Extract trainer ID from JWT
    String trainerId = JWTConfig.extractUserId(jwt);

    // 🔐 Check if the appointment belongs to this trainer
    Appointments existingAppointment = appointmentService.getAppointmentById(appointment.getId());
    if (existingAppointment == null || !existingAppointment.getTrainerId().equals(trainerId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You can only update your own appointments.");
    }

    // 🎯 Update status
    existingAppointment.setStatus(appointment.getStatus());
    Appointments updatedAppointment = appointmentService.updateAppointment(existingAppointment);

    return ResponseEntity.ok(updatedAppointment);
}


 
@GetMapping("/all")
public ResponseEntity<?> getAllAppointments(
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
    if (role == null || !role.equals("OWNER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied. Owner role required.");
    }
 
    List<Appointments> appointments = appointmentService.getAllAppointments();
 
    return ResponseEntity.ok(appointments);
}
}
