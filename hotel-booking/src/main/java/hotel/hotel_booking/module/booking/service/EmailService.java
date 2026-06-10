package hotel.hotel_booking.module.booking.service;

import hotel.hotel_booking.module.booking.entity.Booking;
import hotel.hotel_booking.module.user.entity.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;

import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    // JavaMailSender = le "facteur" de Spring
    // Il prend ton email et l'envoie via SMTP Gmail
    private final JavaMailSender mailSender;

    // templateEngine = moteur Thymeleaf
    // Il transforme ton template HTML en email avec les vraies données
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ─────────────────────────────────────────────────────────
    // EMAIL 1 : CONFIRMATION DE RÉSERVATION
    // Déclenché : quand le client confirme sa réservation
    // ─────────────────────────────────────────────────────────
    @Async  // ← Envoie l'email dans un thread séparé
    // Le client reçoit sa réponse API immédiatement
    // L'email part quelques secondes après en arrière-plan
    public CompletableFuture<Void> sendBookingConfirmation(Booking booking) {
        try {
            // Étape A : Préparer les données pour le template HTML
            Context ctx = new Context(Locale.FRENCH);
            ctx.setVariable("clientFirstName",  booking.getUser().getFirstName());
            ctx.setVariable("reference",        booking.getBookingReference());
            ctx.setVariable("hotelName",        booking.getRoom().getHotel().getName());
            ctx.setVariable("hotelAddress",     booking.getRoom().getHotel().getAddress());
            ctx.setVariable("hotelPhone",       booking.getRoom().getHotel().getPhoneNumber());
            ctx.setVariable("hotelEmail",       booking.getRoom().getHotel().getEmail());
            ctx.setVariable("roomType",         booking.getRoom().getType().getLabel());
            ctx.setVariable("roomImage",        booking.getRoom().getPrimaryImageUrl());
            ctx.setVariable("checkIn",          formatDate(booking.getCheckIn()));
            ctx.setVariable("checkOut",         formatDate(booking.getCheckOut()));
            ctx.setVariable("nights",           booking.getNights());
            ctx.setVariable("totalPrice",       booking.getTotalPrice());
            ctx.setVariable("guestsCount",      booking.getGuestsCount());
            ctx.setVariable("specialRequests",  booking.getSpecialRequests());
            ctx.setVariable("viewUrl",
                    frontendUrl + "/bookings/" + booking.getId());
            ctx.setVariable("cancelUrl",
                    frontendUrl + "/bookings/" + booking.getId() + "/cancel");
            ctx.setVariable("mapUrl",
                    "https://maps.google.com/?q=" +
                            booking.getRoom().getHotel().getLatitude() + "," +
                            booking.getRoom().getHotel().getLongitude());

            // Étape B : Transformer le template en HTML final
            // Spring cherche : resources/templates/email/booking-confirmation.html
            String htmlContent = templateEngine.process(
                    "email/booking-confirmation", ctx);

            // Étape C : Construire le message email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "LuxeStay Réservations");
            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("✅ Confirmation — " +
                    booking.getBookingReference());
            helper.setText(htmlContent, true); // true = format HTML

            // Étape D : Envoyer via SMTP Gmail
            mailSender.send(message);
            log.info("📧 Email confirmation envoyé à : {}",
                    booking.getUser().getEmail());

        } catch (Exception e) {
            log.error("❌ Erreur envoi email confirmation : {}",
                    e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    // ─────────────────────────────────────────────────────────
    // EMAIL 2 : RAPPEL VEILLE DE L'ARRIVÉE
    // Déclenché : chaque matin à 9h par le scheduler
    // ─────────────────────────────────────────────────────────
    @Async
    public CompletableFuture<Void> sendCheckInReminder(Booking booking) {
        try {
            Context ctx = new Context(Locale.FRENCH);
            ctx.setVariable("clientFirstName",  booking.getUser().getFirstName());
            ctx.setVariable("hotelName",        booking.getRoom().getHotel().getName());
            ctx.setVariable("hotelAddress",     booking.getRoom().getHotel().getAddress());
            ctx.setVariable("hotelPhone",       booking.getRoom().getHotel().getPhoneNumber());
            ctx.setVariable("checkIn",          formatDate(booking.getCheckIn()));
            ctx.setVariable("checkInTime",      booking.getRoom().getHotel().getCheckInTime());
            ctx.setVariable("roomType",         booking.getRoom().getType().getLabel());
            ctx.setVariable("reference",        booking.getBookingReference());
            ctx.setVariable("mapUrl",
                    "https://maps.google.com/?q=" +
                            booking.getRoom().getHotel().getLatitude() + "," +
                            booking.getRoom().getHotel().getLongitude());

            String html = templateEngine.process(
                    "email/checkin-reminder", ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail, "LuxeStay");
            h.setTo(booking.getUser().getEmail());
            h.setSubject("🏨 Votre arrivée demain — " +
                    booking.getRoom().getHotel().getName());
            h.setText(html, true);
            mailSender.send(msg);

            log.info("📧 Rappel check-in envoyé : {}",
                    booking.getUser().getEmail());

        } catch (Exception e) {
            log.error("❌ Erreur email rappel : {}", e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    // ─────────────────────────────────────────────────────────
    // EMAIL 3 : ANNULATION
    // ─────────────────────────────────────────────────────────
    @Async
    public CompletableFuture<Void> sendCancellationEmail(
            Booking booking, String reason) {
        try {
            Context ctx = new Context(Locale.FRENCH);
            ctx.setVariable("clientFirstName", booking.getUser().getFirstName());
            ctx.setVariable("reference",       booking.getBookingReference());
            ctx.setVariable("hotelName",       booking.getRoom().getHotel().getName());
            ctx.setVariable("checkIn",         formatDate(booking.getCheckIn()));
            ctx.setVariable("totalPrice",      booking.getTotalPrice());
            ctx.setVariable("reason",          reason);
            ctx.setVariable("searchUrl", frontendUrl + "/search");

            String html = templateEngine.process(
                    "email/booking-cancellation", ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail, "LuxeStay");
            h.setTo(booking.getUser().getEmail());
            h.setSubject("❌ Annulation — " + booking.getBookingReference());
            h.setText(html, true);
            mailSender.send(msg);

        } catch (Exception e) {
            log.error("❌ Erreur email annulation : {}", e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    // ─────────────────────────────────────────────────────────
    // EMAIL 4 : RELANCE IA — Généré par Claude
    // ─────────────────────────────────────────────────────────
    @Async
    public CompletableFuture<Void> sendAiGeneratedFollowUp(
            User user, String aiMessage, String hotelName) {
        try {
            Context ctx = new Context(Locale.FRENCH);
            ctx.setVariable("clientFirstName", user.getFirstName());
            ctx.setVariable("aiMessage",       aiMessage);
            ctx.setVariable("hotelName",       hotelName);
            ctx.setVariable("searchUrl", frontendUrl + "/search");

            String html = templateEngine.process(
                    "email/ai-followup", ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail, "LuxeStay — Votre conseiller personnel");
            h.setTo(user.getEmail());
            h.setSubject("💡 Une offre personnalisée pour vous, " +
                    user.getFirstName());
            h.setText(html, true);
            mailSender.send(msg);

        } catch (Exception e) {
            log.error("❌ Erreur email IA relance : {}", e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    private String formatDate(LocalDate date) {
        return date.format(
                DateTimeFormatter.ofPattern("EEEE d MMMM yyyy", Locale.FRENCH));
    }
}