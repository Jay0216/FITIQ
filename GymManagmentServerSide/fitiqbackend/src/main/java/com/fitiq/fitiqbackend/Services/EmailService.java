package com.fitiq.fitiqbackend.Services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Date;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.gym.name:FitIQ}")
    private String gymName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendRenewalReminderEmail(String toEmail, String memberName,
                                         String subscriptionType, Date endDate) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("⏰ Your " + gymName + " Membership Expires in 7 or 8 Days");
            helper.setText(buildEmailHtml(memberName, subscriptionType, endDate), true);

            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Failed to send renewal email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildEmailHtml(String memberName, String subscriptionType, Date endDate) {
        // Format the end date nicely
        java.time.LocalDate localDate = endDate.toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDate();
        String formattedDate = localDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));

        String planColor = switch (subscriptionType.toLowerCase()) {
            case "premium" -> "#f97316";
            case "standard" -> "#3b82f6";
            default -> "#22c55e";
        };

        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background:#0f1117;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0"
                           style="background:#151724;border-radius:16px;overflow:hidden;
                                  border:1px solid #2a2d3e;max-width:600px;width:100%%;">

                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                                   padding:36px 40px;text-align:center;">
                          <h1 style="margin:0;color:#ffffff;font-size:28px;
                                     font-weight:700;letter-spacing:-0.5px;">
                            💪 FitIQ
                          </h1>
                          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                            Membership Renewal Reminder
                          </p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">

                          <p style="color:#e2e8f0;font-size:16px;margin:0 0 8px;">
                            Hi <strong>%s</strong>,
                          </p>
                          <p style="color:#8a8fa8;font-size:15px;margin:0 0 28px;
                                    line-height:1.6;">
                            Your FitIQ membership is expiring soon. Renew now to keep
                            your access to all workouts, trainers, and premium features
                            without interruption.
                          </p>

                          <!-- Plan card -->
                          <table width="100%%" cellpadding="0" cellspacing="0"
                                 style="background:#1e2130;border-radius:12px;
                                        border:1px solid #2a2d3e;margin-bottom:28px;">
                            <tr>
                              <td style="padding:24px;">
                                <p style="margin:0 0 16px;color:#8a8fa8;
                                          font-size:12px;text-transform:uppercase;
                                          letter-spacing:1px;">Current Plan</p>
                                <table width="100%%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td>
                                      <span style="background:%s22;color:%s;
                                                   border:1px solid %s44;
                                                   padding:4px 14px;border-radius:20px;
                                                   font-size:13px;font-weight:600;
                                                   text-transform:capitalize;">
                                        %s Plan
                                      </span>
                                    </td>
                                    <td align="right">
                                      <span style="color:#ef4444;font-size:13px;
                                                   font-weight:600;">
                                        ⏰ Expires %s
                                      </span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- CTA -->
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="http://localhost:5173/payment"
                                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                                          color:#ffffff;text-decoration:none;
                                          padding:14px 40px;border-radius:8px;
                                          font-size:15px;font-weight:600;
                                          letter-spacing:0.3px;">
                                  Renew My Membership →
                                </a>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding:20px 40px;border-top:1px solid #2a2d3e;
                                   text-align:center;">
                          <p style="margin:0;color:#4a4f6a;font-size:12px;line-height:1.6;">
                            You're receiving this because you're a FitIQ member.<br/>
                            © 2025 FitIQ. All rights reserved.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(memberName, planColor, planColor, planColor,
                          subscriptionType, formattedDate);
    }

public void sendMonthlyReport(String toEmail, String reportContent) {
    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("📊 Monthly Report - " + gymName);

        helper.setText(buildMonthlyReportHtml(reportContent), true);

        mailSender.send(message);

    } catch (MessagingException e) {
        System.err.println("Failed to send monthly report to " + toEmail + ": " + e.getMessage());
    }
}

private String buildMonthlyReportHtml(String content) {

    String currentMonth = java.time.LocalDate.now()
            .format(java.time.format.DateTimeFormatter.ofPattern("MMMM yyyy"));

    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0"
                 style="background:#0f1117;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                       style="background:#151724;border-radius:16px;
                              border:1px solid #2a2d3e;overflow:hidden;
                              max-width:600px;width:100%%;">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#22c55e,#4ade80);
                               padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">
                        📊 Monthly Insights
                      </h1>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                        %s • %s
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">

                      <p style="color:#e2e8f0;font-size:16px;margin:0 0 16px;">
                        Hello,
                      </p>

                      <p style="color:#8a8fa8;font-size:15px;margin:0 0 28px;line-height:1.6;">
                        Here is your gym performance summary for this month.
                      </p>

                      <!-- Report Content -->
                      <div style="background:#1e2130;padding:24px;border-radius:12px;
                                  border:1px solid #2a2d3e;margin-bottom:28px;">
                        %s
                      </div>

                      <!-- Footer Note -->
                      <p style="color:#6b7280;font-size:13px;text-align:center;">
                        Keep growing your business 🚀
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #2a2d3e;
                               text-align:center;">
                      <p style="margin:0;color:#4a4f6a;font-size:12px;line-height:1.6;">
                        © 2025 %s. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """.formatted(gymName, currentMonth, content, gymName);
}
}