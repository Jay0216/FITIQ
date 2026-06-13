package com.fitiq.fitiqbackend.DTO;

public class DonePaymentRequest {
    private String subscriptionId;
    private String subscriptionType;
    private double amount;

    private boolean savePaymentMethod;
    private String cardHolderName;
    private String cardNumber;
    private String expiry;  // e.g. "02/27"
    private boolean isDefault;

    // Getters & Setters
    public String getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(String subscriptionId) { this.subscriptionId = subscriptionId; }

    public String getSubscriptionType() { return subscriptionType; }
    public void setSubscriptionType(String subscriptionType) { this.subscriptionType = subscriptionType; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public boolean isSavePaymentMethod() { return savePaymentMethod; }
    public void setSavePaymentMethod(boolean savePaymentMethod) { this.savePaymentMethod = savePaymentMethod; }

    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getExpiry() { return expiry; }
    public void setExpiry(String expiry) { this.expiry = expiry; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}
