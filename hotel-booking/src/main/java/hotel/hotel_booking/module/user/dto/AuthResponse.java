package hotel.hotel_booking.module.user.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        UserResponseDTO user,
        Long expiresIn
) {}