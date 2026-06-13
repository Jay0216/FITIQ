package com.fitiq.fitiqbackend.Schedulers;

import com.fitiq.fitiqbackend.Services.EmailService;
import com.fitiq.fitiqbackend.Repository.OwnerRepository;
import com.fitiq.fitiqbackend.Models.Owner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MonthlyReportScheduler {

    private final EmailService emailService;
    private final OwnerRepository ownerRepository;

    public MonthlyReportScheduler(EmailService emailService,
                                  OwnerRepository ownerRepository) {
        this.emailService = emailService;
        this.ownerRepository = ownerRepository;
    }

    @Scheduled(cron = "0 59 23 L * ?")
    public void sendMonthlyReportToOwner() {

        System.out.println("📊 Running Monthly Report Job...");

        // ✅ Get owner from DB
        Owner owner = ownerRepository.findTopByOrderByIdAsc();

        if (owner == null || owner.getEmail() == null) {
            System.out.println("❌ No owner email found!");
            return;
        }

        String ownerEmail = owner.getEmail();

        // ✅ Generate report (for now static, later dynamic)
        String reportContent = """
                <h2>📊 Monthly Business Report</h2>
                <p>Here is your gym performance summary:</p>
                <ul>
                    <li>Total Members: 120</li>
                    <li>Active Subscriptions: 95</li>
                    <li>Monthly Revenue: Rs. 250,000</li>
                </ul>
                <p>Keep growing 🚀</p>
                """;

        // ✅ Send email
        emailService.sendMonthlyReport(ownerEmail, reportContent);

        System.out.println("✅ Monthly report sent to owner: " + ownerEmail);
    }
}