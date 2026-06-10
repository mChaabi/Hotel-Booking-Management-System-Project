package hotel.hotel_booking.module.booking.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull(message = "La chambre est obligatoire")
        UUID roomId,

        @NotNull(message = "La date d'arrivée est obligatoire")
        @FutureOrPresent(message = "La date d'arrivée ne peut pas être passée")
        LocalDate checkIn,

        @NotNull(message = "La date de départ est obligatoire")
        @Future(message = "La date de départ doit être dans le futur")
        LocalDate checkOut,

        @Min(value = 1, message = "Minimum 1 voyageur")
        @Max(value = 20, message = "Maximum 20 voyageurs")
        Integer guestsCount,

        @Size(max = 500, message = "500 caractères maximum")
        String specialRequests
) {
    // Validation personnalisée dans un Record
    @AssertTrue(message = "La date de départ doit être après l'arrivée")
    @JsonIgnore
    public boolean isValidDateRange() {
        if (checkIn == null || checkOut == null) return true;
        return checkOut.isAfter(checkIn);
    }
}