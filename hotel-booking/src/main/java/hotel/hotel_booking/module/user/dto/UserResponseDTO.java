package hotel.hotel_booking.module.user.dto;

import hotel.hotel_booking.module.user.entity.UserRole;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        UserRole role,
        Integer loyaltyPoints,
        Boolean isActive,
        LocalDateTime createdAt
) {}