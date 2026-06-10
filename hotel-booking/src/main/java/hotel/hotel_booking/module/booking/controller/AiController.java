package hotel.hotel_booking.module.booking.controller;

import hotel.hotel_booking.module.booking.entity.ChatRequest;
import hotel.hotel_booking.module.booking.service.AiService;
import hotel.hotel_booking.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody ChatRequest req,
            @AuthenticationPrincipal User user) {

        String response = aiService.chat(
                req.getMessage(),
                user.getId(),
                req.getHistory()
        );

        // Protection : si response est null, on renvoie une chaîne vide ou un message d'erreur
        String finalResponse = (response != null) ? response : "Désolé, je n'ai pas pu générer de réponse.";

        System.out.println("Réponse IA: " + finalResponse);

        Map<String, String> body = new HashMap<>();
        body.put("response", finalResponse);

        return ResponseEntity.ok(body);
    }
}