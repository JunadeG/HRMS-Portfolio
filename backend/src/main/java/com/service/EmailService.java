package com.service;

import com.model.Meeting;
import com.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendPasswordResetLink(String to, String resetLink) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            String htmlMsg = "<h3>HRMS Password Reset Request</h3>"
                    + "<p>You requested a password reset for your HRMS account.</p>"
                    + "<p>Please click the link below to set a new password:</p>"
                    + "<p><a href=\"" + resetLink + "\">Reset Password</a></p>"
                    + "<p>This link will expire in 15 minutes.</p>"
                    + "<p>If you did not request this, please ignore this email.</p>";
            helper.setText(htmlMsg, true);
            helper.setTo(to);
            helper.setSubject("HRMS Password Reset Request");
            mailSender.send(mimeMessage);
            log.info("Successfully sent password reset link to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send password reset link to {}: {}", to, e.getMessage());
        }
    }

    public void sendMeetingInvitationEmail(User attendee, Meeting meeting) {
        if (attendee == null || !StringUtils.hasText(attendee.getWorkEmail())) {
            log.warn("Cannot send meeting invitation. Attendee or their work email is null for meeting ID: {}", meeting.getId());
            return;
        }

        try {
            Context context = new Context();

            ZoneId userTimeZone = ZoneId.systemDefault();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy").withZone(userTimeZone);
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a").withZone(userTimeZone);

            String startTime = timeFormatter.format(meeting.getStartTime());
            String endTime = meeting.getEndTime() != null ? timeFormatter.format(meeting.getEndTime()) : "";

            context.setVariable("subject", "Meeting Invitation: " + meeting.getTitle());
            context.setVariable("attendeeName", attendee.getFirstName());
            context.setVariable("meetingTitle", meeting.getTitle());
            context.setVariable("meetingDate", dateFormatter.format(meeting.getStartTime()));
            context.setVariable("meetingTime", startTime + (endTime.isEmpty() ? "" : " - " + endTime));
            context.setVariable("meetingDescription", meeting.getDescription());
            context.setVariable("organizerName", meeting.getCreator().getFirstName() + " " + meeting.getCreator().getLastName());
            context.setVariable("employeeId", StringUtils.hasText(attendee.getEmployeeId()) ? attendee.getEmployeeId() : "N/A");

            // --- ADD THIS LINE ---
            context.setVariable("meetingLink", meeting.getMeetingLink());

            String htmlBody = templateEngine.process("meeting-invitation-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setTo(attendee.getWorkEmail());
            helper.setSubject("Meeting Invitation: " + meeting.getTitle());
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);
            log.info("Successfully sent meeting invitation to {} for meeting '{}'", attendee.getWorkEmail(), meeting.getTitle());

        } catch (Exception e) {
            log.error("Failed to send meeting invitation to {}: {}", attendee.getWorkEmail(), e.getMessage(), e);
        }
    }
}