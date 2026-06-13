package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.PaymentMethods;
import com.fitiq.fitiqbackend.Repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    // ➕ Add Payment Method
    public PaymentMethods addPaymentMethod(String memberId,
                                          String cardHolderName,
                                          String cardNumber,
                                          String expiry,
                                          boolean isDefault) {

        String last4 = extractLast4(cardNumber);
        String brand = detectCardBrand(cardNumber);
        String token = generateToken();

        // If default → unset previous
        if (isDefault) {
            unsetExistingDefault(memberId);
        }

        PaymentMethods paymentMethod = new PaymentMethods(
                memberId,
                cardHolderName,
                brand,
                last4,
                expiry,
                token,
                isDefault,
                getCurrentTime()
        );

        return paymentMethodRepository.save(paymentMethod);
    }

    // 📥 Get all payment methods
    public List<PaymentMethods> getPaymentMethods(String memberId) {
        return paymentMethodRepository.findByMemberId(memberId);
    }

    // ⭐ Get default method
    public PaymentMethods getDefaultPaymentMethod(String memberId) {
        Optional<PaymentMethods> optional =
                paymentMethodRepository.findByMemberIdAndIsDefaultTrue(memberId);

        return optional.orElse(null);
    }

    // 🔁 Set default payment method
    public void setDefaultPaymentMethod(String memberId, String paymentMethodId) {

        unsetExistingDefault(memberId);

        Optional<PaymentMethods> optional = paymentMethodRepository.findById(paymentMethodId);

        if (optional.isPresent()) {
            PaymentMethods pm = optional.get();
            pm.setDefault(true);
            paymentMethodRepository.save(pm);
        }
    }

    // ❌ Delete payment method
    public void deletePaymentMethod(String id) {
        paymentMethodRepository.deleteById(id);
    }

    // =========================
    // 🔧 Helper Methods
    // =========================

    private String extractLast4(String cardNumber) {
        return cardNumber.substring(cardNumber.length() - 4);
    }

    private String detectCardBrand(String cardNumber) {
        if (cardNumber.startsWith("4")) return "VISA";
        if (cardNumber.startsWith("5")) return "MASTERCARD";
        return "UNKNOWN";
    }

    private String generateToken() {
        return "tok_" + UUID.randomUUID().toString();
    }

    private void unsetExistingDefault(String memberId) {
        Optional<PaymentMethods> existing =
                paymentMethodRepository.findByMemberIdAndIsDefaultTrue(memberId);

        if (existing.isPresent()) {
            PaymentMethods pm = existing.get();
            pm.setDefault(false);
            paymentMethodRepository.save(pm);
        }
    }

    private String getCurrentTime() {
        return java.time.LocalDateTime.now().toString();
    }
}
