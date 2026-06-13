package com.fitiq.fitiqbackend.Controllers;

import com.fitiq.fitiqbackend.JWT.JWTConfig;
import com.fitiq.fitiqbackend.Models.PaymentMethods;
import com.fitiq.fitiqbackend.Models.PaymentTransaction;
import com.fitiq.fitiqbackend.Models.Subscription;
import com.fitiq.fitiqbackend.Services.PaymentMethodService;
import com.fitiq.fitiqbackend.Services.PaymentTransactionService;
import com.fitiq.fitiqbackend.Services.SubscriptionService;
import com.fitiq.fitiqbackend.DTO.DonePaymentRequest;
import com.fitiq.fitiqbackend.DTO.DonePaymentResponse;
import com.fitiq.fitiqbackend.DTO.PaymentMethodRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentMethodService paymentMethodService;
    private final PaymentTransactionService paymentTransactionService;
    private final SubscriptionService subscriptionService;

    @Autowired
    public PaymentController(PaymentMethodService paymentMethodService,
                             PaymentTransactionService paymentTransactionService,
                             SubscriptionService subscriptionService) {
        this.paymentMethodService = paymentMethodService;
        this.paymentTransactionService = paymentTransactionService;
        this.subscriptionService = subscriptionService;
    }

    // ➕ Add / Save Payment Method
    @PostMapping("/method")
    public ResponseEntity<?> addPaymentMethod(
            @RequestHeader("Authorization") String token,
            @RequestBody PaymentMethodRequest request) {

        String memberId = validateMemberToken(token);
        if (memberId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");

        PaymentMethods paymentMethod = paymentMethodService.addPaymentMethod(
                memberId,
                request.getCardHolderName(),
                request.getCardNumber(),
                request.getExpiry(),
                request.isDefault()
        );

        return ResponseEntity.ok(paymentMethod);
    }

    // 📥 Get all payment methods
    @GetMapping("/methods")
    public ResponseEntity<?> getPaymentMethods(@RequestHeader("Authorization") String token) {

        String memberId = validateMemberToken(token);
        if (memberId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");

        List<PaymentMethods> methods = paymentMethodService.getPaymentMethods(memberId);
        return ResponseEntity.ok(methods);
    }

    // ❌ Delete payment method
    @DeleteMapping("/method/{id}")
    public ResponseEntity<?> deletePaymentMethod(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {

        String memberId = validateMemberToken(token);
        if (memberId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");

        paymentMethodService.deletePaymentMethod(id);
        return ResponseEntity.ok("Payment method deleted successfully");
    }

    // 💳 Complete payment & update subscription
    // 💳 Complete payment & update subscription
@PostMapping("/done")
public ResponseEntity<?> completePayment(
        @RequestHeader("Authorization") String token,
        @RequestBody DonePaymentRequest request) {

    String memberId = validateMemberToken(token);
    if (memberId == null)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");

    // 1️⃣ Fetch subscription
    Subscription subscription = subscriptionService.getSubscriptionById(request.getSubscriptionId());
    if (subscription == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subscription not found");
    }

    // 2️⃣ Update subscription type
    subscription.setType(request.getSubscriptionType());

    // 3️⃣ Handle Date logic (IMPORTANT FIX)
    Date startDate = new Date(); // current date

    Calendar calendar = Calendar.getInstance();
    calendar.setTime(startDate);

    switch (request.getSubscriptionType().toLowerCase()) {
        case "basic":
            calendar.add(Calendar.MONTH, 1);
            break;
        case "standard":
            calendar.add(Calendar.MONTH, 3);
            break;
        case "premium":
            calendar.add(Calendar.YEAR, 1);
            break;
        default:
            calendar.add(Calendar.MONTH, 1);
    }

    Date endDate = calendar.getTime();

    subscription.setStartDate(startDate);
    subscription.setEndDate(endDate);

    subscriptionService.updateSubscription(subscription);

    // 4️⃣ Save payment transaction
    PaymentTransaction transaction = paymentTransactionService.saveTransaction(
            memberId,
            request.getSubscriptionId(),
            request.getAmount()
    );

    // 5️⃣ Save payment method if requested
    PaymentMethods paymentMethod = null;
    if (request.isSavePaymentMethod()) {
        paymentMethod = paymentMethodService.addPaymentMethod(
                memberId,
                request.getCardHolderName(),
                request.getCardNumber(),
                request.getExpiry(),
                request.isDefault()
        );
    }

    // 6️⃣ Response
    DonePaymentResponse responseDTO = new DonePaymentResponse(transaction, paymentMethod);
    return ResponseEntity.ok(responseDTO);
}

// 📄 Get all payment transactions of logged-in member
@GetMapping("/transactions")
public ResponseEntity<?> getTransactions(
        @RequestHeader("Authorization") String token) {

    String memberId = validateMemberToken(token);
    if (memberId == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }

    List<PaymentTransaction> transactions =
            paymentTransactionService.getTransactionsByMemberId(memberId);

    return ResponseEntity.ok(transactions);
}

@GetMapping("/transactions/all")
public ResponseEntity<?> getAllTransactions(
        @RequestHeader("Authorization") String token) {
 
    if (token == null || !token.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid token");
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
 
    List<PaymentTransaction> transactions =
            paymentTransactionService.getAllTransactions();
 
    return ResponseEntity.ok(transactions);
}


    // 🔐 Token validation helper
    private String validateMemberToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) return null;
        String jwt = token.substring(7);
        if (!JWTConfig.validateToken(jwt)) return null;
        String role = JWTConfig.extractRole(jwt);
        if (!"MEMBER".equals(role)) return null;
        return JWTConfig.extractUserId(jwt);
    }
}