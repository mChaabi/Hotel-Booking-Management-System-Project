package hotel.hotel_booking.module.room.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RoomType {
    SINGLE("Chambre Simple"),
    DOUBLE("Chambre Double"),
    TWIN("Chambre Twin"),
    DELUXE("Chambre Deluxe"),
    SUITE("Suite Luxueuse"),
    FAMILY("Chambre Familiale");

    private final String label;
}