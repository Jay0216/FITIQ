package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.PaymentTransaction;
import com.fitiq.fitiqbackend.Repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentTransactionService {

    private final PaymentTransactionRepository repository;

    @Autowired
    public PaymentTransactionService(PaymentTransactionRepository repository) {
        this.repository = repository;
    }

    // Save a new transaction
    public PaymentTransaction saveTransaction(String memberId, String subscriptionId, double amount) {
        PaymentTransaction transaction = new PaymentTransaction(memberId, subscriptionId, amount, LocalDateTime.now());
        return repository.save(transaction);
    }

    // Get all transactions for a member
    public List<PaymentTransaction> getTransactionsByMember(String memberId) {
        return repository.findByMemberId(memberId);
    }

    // Get all transactions for a subscription
    public List<PaymentTransaction> getTransactionsBySubscription(String subscriptionId) {
        return repository.findBySubscriptionId(subscriptionId);
    }

    public List<PaymentTransaction> getTransactionsByMemberId(String memberId) {
      return repository.findByMemberIdOrderByTransactionDateDesc(memberId);
    }

    public List<PaymentTransaction> getAllTransactions() {
       return repository.findAll();
    }
}
