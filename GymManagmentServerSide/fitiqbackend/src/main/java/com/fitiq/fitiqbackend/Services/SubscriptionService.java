package com.fitiq.fitiqbackend.Services;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fitiq.fitiqbackend.Models.Subscription;
import com.fitiq.fitiqbackend.Repository.SubscriptionRepository;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    @Autowired
    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    // Create free trial subscription for new member
    public Subscription createFreeTrial(String memberId) {
        Date startDate = new Date();
        Calendar cal = Calendar.getInstance();
        cal.setTime(startDate);
        cal.add(Calendar.DAY_OF_MONTH, 30); // 30-day free trial
        Date endDate = cal.getTime();

        Subscription subscription = new Subscription(
            memberId,
            "Free Trial",
            startDate,
            endDate,
            true
        );

        return subscriptionRepository.save(subscription);
    }

    public Subscription getSubscriptionByMemberId(String memberId) {
      return subscriptionRepository.findByMemberId(memberId);
    }

    // ✅ Get subscription by ID
    public Subscription getSubscriptionById(String subscriptionId) {
        Optional<Subscription> optional = subscriptionRepository.findById(subscriptionId);
        return optional.orElse(null);
    }

    // ✅ Update subscription (e.g., type)
    public Subscription updateSubscription(Subscription subscription) {
        // Save the updated subscription back to MongoDB
        return subscriptionRepository.save(subscription);
    }

    public Subscription getActiveSubscription(String memberId) {
        return subscriptionRepository.findByMemberIdAndActiveTrue(memberId);
    }

    // optional safer version
    public Subscription getLatestSubscription(String memberId) {
        return subscriptionRepository.findTopByMemberIdOrderByEndDateDesc(memberId);
    }

    public long countSubscriptions() {
      return subscriptionRepository.count();
    }

    // Add to your existing SubscriptionService
public List<Subscription> getSubscriptionsExpiringBetween(Date start, Date end) {
    return subscriptionRepository.findByEndDateBetween(start, end);
}
}
