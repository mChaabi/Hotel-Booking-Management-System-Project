package hotel.hotel_booking.module.user.dto;

import hotel.hotel_booking.module.user.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Prénom obligatoire")
        String firstName,

        @NotBlank(message = "Nom obligatoire")
        String lastName,

        @NotBlank(message = "Email obligatoire")
        @Email(message = "Format email invalide")
        String email,

        @NotBlank(message = "Mot de passe obligatoire")
        @Size(min = 6, message = "Minimum 6 caractères")
        String password,

        String phone,

        // ✅ AJOUT — rôle optionnel, GUEST par défaut
        UserRole role
) {}