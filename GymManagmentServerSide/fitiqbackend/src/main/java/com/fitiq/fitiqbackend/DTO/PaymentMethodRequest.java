package com.fitiq.fitiqbackend.DTO;

public class PaymentMethodRequest {

    private String cardHolderName;
    private String cardNumber;
    private String cardBrand; // VISA, MASTERCARD
    private String expiry;    // new format: "MM/YY"
    private boolean isDefault;

    // Getters & Setters
    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

    public String getExpiry() { return expiry; }
    public void setExpiry(String expiry) { this.expiry = expiry; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}