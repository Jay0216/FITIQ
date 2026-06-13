package com.fitiq.fitiqbackend.Controllers;

import java.io.ByteArrayOutputStream;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.Attendance;
import com.fitiq.fitiqbackend.Models.Member;
import com.fitiq.fitiqbackend.Models.Subscription;
import com.fitiq.fitiqbackend.Services.AttendanceService;
import com.fitiq.fitiqbackend.Services.MemberService;
import com.fitiq.fitiqbackend.Services.SubscriptionService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final MemberService memberService;
    private final AttendanceService attendanceService;
    private final SubscriptionService subscriptionService;

    public AttendanceController(MemberService memberService,
                                AttendanceService attendanceService,
                                SubscriptionService subscriptionService) {
        this.memberService = memberService;
        this.attendanceService = attendanceService;
        this.subscriptionService = subscriptionService;
    }

    // ================= ESP32 STATE =================
    private volatile boolean unlock = false;
    private volatile String message = "";

    // ================= MARK ATTENDANCE =================
    @PostMapping("/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(
            @RequestBody Map<String, String> payload) {

        String membershipId = payload.get("membershipId");

        if (membershipId == null || membershipId.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", "Membership ID is required"));
        }

        Member member = memberService.findByMembershipId(membershipId);

        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "Member not found"));
        }

        Subscription subscription = subscriptionService.getActiveSubscription(member.getId());

        if (subscription == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "error", "message", "No active subscription found"));
        }

        Date today = new Date();

        if (subscription.getEndDate().before(today)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "error", "message", "Subscription expired"));
        }

        attendanceService.markAttendance(member);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Attendance marked successfully",
                "memberName", member.getFullname()
        ));
    }

    // ================= MEMBER ATTENDANCE =================
    @GetMapping("/member/attendancereport")
    public ResponseEntity<?> getMemberAttendance(
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

        String memberId = JWTConfig.extractUserId(jwt);

        List<Attendance> attendance =
                attendanceService.getAttendanceByMemberId(memberId);

        return ResponseEntity.ok(attendance);
    }

    // ================= QR UNLOCK =================
    @PostMapping("/door/qr-unlock")
    public ResponseEntity<Map<String, Object>> qrDoorUnlock(
            @RequestHeader("Authorization") String token) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "error", "message", "Missing token"));
        }

        String jwt = token.substring(7);

        if (!JWTConfig.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "error", "message", "Invalid token"));
        }

        String memberId = JWTConfig.extractUserId(jwt);

        Member member = memberService.findById(memberId);

        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "Member not found"));
        }

        Subscription subscription =
                subscriptionService.getActiveSubscription(member.getId());

        if (subscription == null) {

            unlock = false;
            message = "No active plan";

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "error", "message", "No subscription"));
        }

        Date today = new Date();

        if (subscription.getEndDate().before(today)) {

            unlock = false;
            message = "Subscription expired";

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "error", "message", "Expired"));
        }

        // ================= ESP32 COMMAND =================
        unlock = true;
        message = "Welcome " + member.getFullname();

        attendanceService.markAttendance(member);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Door unlock queued",
                "memberName", member.getFullname()
        ));
    }

    // ================= ESP32: GET COMMAND =================
    @GetMapping("/device/door-command")
    public Map<String, Object> getDoorCommand() {

        boolean current = unlock;
        String msg = message;

        // reset after reading
        unlock = false;
        message = "";

        return Map.of(
                "unlock", current,
                "message", msg
        );
    }

    // ================= ESP32: EVENT LOG =================
    @PostMapping("/device/event")
    public ResponseEntity<?> receiveDeviceEvent(
            @RequestBody Map<String, String> body) {

        System.out.println("ESP32 EVENT: " + body);

        return ResponseEntity.ok().build();
    }

    // ================= QR GENERATOR =================
    @GetMapping("/generate-door-qr")
    public ResponseEntity<byte[]> generateDoorQr() throws Exception {

        String qrContent =
                "http://localhost:8080/api/attendance/door/qr-unlock";

        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        BitMatrix bitMatrix = qrCodeWriter.encode(
                qrContent,
                BarcodeFormat.QR_CODE,
                300,
                300
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", out);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/png")
                .body(out.toByteArray());
    }
}