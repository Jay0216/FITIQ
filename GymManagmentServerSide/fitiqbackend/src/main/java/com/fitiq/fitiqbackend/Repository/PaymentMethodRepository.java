package com.fitiq.fitiqbackend.Repository;

import com.fitiq.fitiqbackend.Models.PaymentMethods;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends MongoRepository<PaymentMethods, String> {

    List<PaymentMethods> findByMemberId(String memberId);

    Optional<PaymentMethods> findByMemberIdAndIsDefaultTrue(String memberId);
}