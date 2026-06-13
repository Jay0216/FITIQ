package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payment_methods")
public class PaymentMethods {

    @Id
    private String id;

    private String memberId;

    private String cardHolderName;
    private String cardBrand;   // VISA, MASTERCARD
    private String last4;       // last 4 digits only

    private int expiryMonth;
    private int expiryYear;

    private String token;       // simulated token

    private boolean isDefault;

    private String createdAt;   // simple string format like "2026-03-20 20:30"

    // Constructors
    public PaymentMethods() {}

    public PaymentMethods(String memberId, String cardHolderName, String cardBrand,
                          String last4, String expiry, // new expiry input as MM/YY
                          String token, boolean isDefault, String createdAt) {
        this.memberId = memberId;
        this.cardHolderName = cardHolderName;
        this.cardBrand = cardBrand;
        this.last4 = last4;

        // Parse expiry "MM/YY"
        if (expiry != null && expiry.contains("/")) {
            String[] parts = expiry.split("/");
            this.expiryMonth = Integer.parseInt(parts[0]);
            this.expiryYear = 2000 + Integer.parseInt(parts[1]); // 27 -> 2027
        }

        this.token = token;
        this.isDefault = isDefault;
        this.createdAt = createdAt;
    }

    // Getters & Setters

    public String getId() { return id; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }

    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

    public String getLast4() { return last4; }
    public void setLast4(String last4) { this.last4 = last4; }

    public int getExpiryMonth() { return expiryMonth; }
    public void setExpiryMonth(int expiryMonth) { this.expiryMonth = expiryMonth; }

    public int getExpiryYear() { return expiryYear; }
    public void setExpiryYear(int expiryYear) { this.expiryYear = expiryYear; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}