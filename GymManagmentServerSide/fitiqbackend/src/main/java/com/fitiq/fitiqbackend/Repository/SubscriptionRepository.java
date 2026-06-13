package com.fitiq.fitiqbackend.Repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fitiq.fitiqbackend.Models.Subscription;


@Repository
public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    Subscription findByMemberId(String memberId);

    // Get active subscription
    Subscription findByMemberIdAndActiveTrue(String memberId);

    // OR (better: latest subscription)
    Subscription findTopByMemberIdOrderByEndDateDesc(String memberId);

    List<Subscription> findByEndDateBetween(Date start, Date end);
}