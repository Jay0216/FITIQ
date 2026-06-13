package com.fitiq.fitiqbackend.Controllers;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fitiq.fitiqbackend.DTO.MemberLoginRequest;
import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.Member;
import com.fitiq.fitiqbackend.Services.MemberService;
import com.fitiq.fitiqbackend.Services.SubscriptionService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import net.glxn.qrgen.QRCode;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberAuthController {

    private final MemberService memberService;
    private final SubscriptionService subscriptionService;

    public MemberAuthController(MemberService memberService, SubscriptionService subscriptionService) {
        this.memberService = memberService;
        this.subscriptionService = subscriptionService;
    }

    // Register Member
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Member request) {

        Member saved = memberService.registerMember(
                request.getFullname(),
                request.getPhonenumber(),
                request.getEmail(),
                request.getDateofbirth(),
                request.getPassword()
        );

        // Generate QR Code using membershipId
        ByteArrayOutputStream out = QRCode.from(saved.getMembershipId())
                .withSize(250, 250)
                .stream();

        String qrBase64 = Base64.getEncoder().encodeToString(out.toByteArray());

        // Create Free Trial Subscription
        subscriptionService.createFreeTrial(saved.getId());

        // Hide password before sending response
        saved.setPassword(null);

        return ResponseEntity.ok(Map.of(
                "member", saved,
                "qrCode", "data:image/png;base64," + qrBase64
        ));
    }

    // Generate QR using membershipId
    @GetMapping("/generate-qr/{memberId}")
    public ResponseEntity<byte[]> generateQr(@PathVariable String memberId) throws Exception {

        Member member = memberService.findByMembershipId(memberId);

        if (member == null) {
            return ResponseEntity.notFound().build();
        }

        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        BitMatrix bitMatrix = qrCodeWriter.encode(
                member.getMembershipId(),
                BarcodeFormat.QR_CODE,
                300,
                300
        );

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();

        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

        byte[] qrImage = pngOutputStream.toByteArray();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/png")
                .body(qrImage);
    }

// Login Member
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody MemberLoginRequest request) {

    Member member = memberService.findByEmail(request.getEmail());

    if (member == null) {
        return ResponseEntity.status(401).body(Map.of(
                "message", "Invalid email or password"
        ));
    }

    // Password check (later replace with BCrypt)
    if (!member.getPassword().equals(request.getPassword())) {
        return ResponseEntity.status(401).body(Map.of(
                "message", "Invalid email or password"
        ));
    }

    // Generate JWT Token with role
    String token = JWTConfig.generateToken(member.getId(), "MEMBER");

    // Hide password before sending response
    member.setPassword(null);

    return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "token", token,
            "member", member,
            "qrCode", member.getQrCode()
    ));
}


// Get total registered members count
@GetMapping("/count")
public ResponseEntity<?> getTotalMembersCount() {

    long count = memberService.countMembers();

    return ResponseEntity.ok(Map.of(
            "totalMembers", count
    ));
}
}