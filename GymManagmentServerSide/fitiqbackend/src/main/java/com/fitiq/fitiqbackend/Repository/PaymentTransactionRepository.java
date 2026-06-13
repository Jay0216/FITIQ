package com.fitiq.fitiqbackend.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.fitiq.fitiqbackend.Models.PaymentTransaction;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {

    List<PaymentTransaction> findByMemberId(String memberId);
    List<PaymentTransaction> findBySubscriptionId(String subscriptionId);

    List<PaymentTransaction> findByMemberIdOrderByTransactionDateDesc(String memberId);
}
