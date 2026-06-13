package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "paymentTransactions")
public class PaymentTransaction {

    @Id
    private String id;

    private String memberId;
    private String subscriptionId;

    private double amount;

    private LocalDateTime transactionDate;

    // Constructors
    public PaymentTransaction() {}

    public PaymentTransaction(String memberId, String subscriptionId, double amount, LocalDateTime transactionDate) {
        this.memberId = memberId;
        this.subscriptionId = subscriptionId;
        this.amount = amount;
        this.transactionDate = transactionDate;
    }

    // Getters & Setters
    public String getId() {
        return id;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(String subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}
