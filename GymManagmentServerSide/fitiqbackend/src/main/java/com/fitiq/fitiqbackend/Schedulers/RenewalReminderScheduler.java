package com.fitiq.fitiqbackend.Schedulers;

import com.fitiq.fitiqbackend.Models.Member;
import com.fitiq.fitiqbackend.Models.Subscription;
import com.fitiq.fitiqbackend.Services.EmailService;
import com.fitiq.fitiqbackend.Services.MemberService;
import com.fitiq.fitiqbackend.Services.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Component
public class RenewalReminderScheduler {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private EmailService emailService;

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    //@Scheduled(cron = "0 * * * * *")
    public void sendRenewalReminders() {
        System.out.println("[Scheduler] Running renewal reminder check...");

        // Calculate the target date window: exactly 7 days from now
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.add(Calendar.DAY_OF_YEAR, 7);
        Date windowStart = cal.getTime();

        cal.add(Calendar.DAY_OF_YEAR, 1); // end of that day
        Date windowEnd = cal.getTime();

        // Fetch subscriptions expiring in that window
        List<Subscription> expiringSoon =
                subscriptionService.getSubscriptionsExpiringBetween(windowStart, windowEnd);

        System.out.println("[Scheduler] Found " + expiringSoon.size() + " subscriptions expiring in 7 days.");

        for (Subscription sub : expiringSoon) {
            try {
                Member member = memberService.findById(sub.getMemberId());
                if (member == null) continue;

                emailService.sendRenewalReminderEmail(
                        member.getEmail(),
                        member.getFullname(),
                        sub.getType(),
                        sub.getEndDate()
                );

                System.out.println("[Scheduler] Sent reminder to: " + member.getEmail());

            } catch (Exception e) {
                System.err.println("[Scheduler] Error processing subscription "
                        + sub.getId() + ": " + e.getMessage());
            }
        }
    }
}