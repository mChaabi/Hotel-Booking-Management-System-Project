package hotel.hotel_booking.commons.config;

import hotel.hotel_booking.module.booking.entity.BookingStatus;
import hotel.hotel_booking.module.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailScheduler {

    private final BookingRepository bookingRepo;

    // Chaque jour à 9h — rappels arrivée demain
    @Scheduled(cron = "0 0 9 * * *")
    public void sendCheckInReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // ✅ Utilise maintenant la méthode avec @Query — plus d'erreur
        var arrivals = bookingRepo.findByCheckInAndStatus(
                tomorrow, BookingStatus.CONFIRMED
        );

        log.info("Envoi de {} rappels check-in", arrivals.size());
        // Envoyer emails...
    }

    // Chaque nuit à minuit — annuler réservations expirées
    @Scheduled(cron = "0 0 0 * * *")
    public void cancelExpiredBookings() {
        LocalDateTime limit = LocalDateTime.now().minusHours(24);
        int count = bookingRepo.cancelExpiredPending(limit);
        log.info("{} réservations expirées annulées", count);
    }
}