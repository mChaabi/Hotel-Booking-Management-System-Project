package hotel.hotel_booking.module.booking.service;

import hotel.hotel_booking.module.booking.entity.Booking;
import hotel.hotel_booking.module.booking.repository.BookingRepository;
import hotel.hotel_booking.module.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AiService {

    private final WebClient webClient;
    private final BookingRepository bookingRepo;
    private final EmailService emailService;
    private final String apiKey; // Define this as a final field

    public AiService(
            @Value("${app.ai-api-key}") String apiKey,
            BookingRepository bookingRepo,
            EmailService emailService) {

        this.apiKey = apiKey; // Assign to the field so callClaude can use it
        this.bookingRepo = bookingRepo;
        this.emailService = emailService;

        this.webClient = WebClient.builder()
                .baseUrl("https://api.groq.com/openai/v1") // Using Groq URL
                .defaultHeader("Content-Type", "application/json")
                // Authorization is set here, but we also use the header in callClaude
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    // ─── RÔLE 1 : Recommandation personnalisée ────────────────
    public String getRecommendation(User user, String city,
                                    LocalDate checkIn, LocalDate checkOut, int guests) {

        // Historique des 5 dernières réservations
        List<Booking> history =
                bookingRepo.findTop5ByUserOrderByCreatedAtDesc(user);

        String historyText = history.isEmpty()
                ? "Aucune réservation précédente"
                : history.stream().map(b ->
                        b.getRoom().getHotel().getName() + " ("
                                // To this:
                                + b.getRoom().getType().name()
                                + ", " + b.getRoom().getHotel().getStars()
                                + " étoiles, " + b.getTotalPrice() + " MAD)")
                .collect(Collectors.joining(" | "));

        String prompt = """
            Tu es un concierge hôtelier expert au Maroc.
            Client : %s %s
            Historique : %s
            Recherche : %s du %s au %s, %d voyageur(s)

            Rédige UNE recommandation personnalisée en 2 phrases maximum.
            Sois précis, chaleureux, en français.
            Ne commence pas par "Je".
            """.formatted(
                user.getFirstName(), user.getLastName(),
                historyText, city, checkIn, checkOut, guests);

        return callClaude(prompt, 150);
    }

    // ─── RÔLE 2 : Détection risque d'annulation ──────────────
    public String analyzeCancellationRisk(List<Booking> bookings) {
        String bookingsSummary = bookings.stream()
                .map(b -> "Réservation %s : client %s %s, hôtel %s, "
                        + "check-in %s, montant %s MAD, statut %s"
                        .formatted(
                                b.getBookingReference(),
                                b.getUser().getFirstName(),
                                b.getUser().getLastName(),
                                b.getRoom().getHotel().getName(),
                                b.getCheckIn(), b.getTotalPrice(),
                                b.getStatus()))
                .collect(Collectors.joining("\n"));

        String prompt = """
            Tu es un analyste hôtelier. Voici les réservations à venir :
            %s

            Identifie les réservations à risque d'annulation et
            propose des actions concrètes pour les fidéliser.
            Réponds en JSON avec ce format :
            {"risques": [{"reference": "BK-...", "risque": "haut/moyen/bas",
            "action": "..."}], "resume": "..."}
            """.formatted(bookingsSummary);

        return callClaude(prompt, 400);
    }

    // ─── RÔLE 3 : Génération email de relance personnalisé ───
    @Async
    public void schedulePersonalizedFollowUp(
            User user, Booking booking) {
        try {
            String prompt = """
                Rédige un email de remerciement chaleureux en français
                pour %s %s qui vient de réserver la %s à %s.
                Séjour du %s au %s. Montant : %s MAD.
                Propose-lui 2 activités à faire dans cette ville.
                Ton familier mais professionnel. Maximum 4 phrases.
                """.formatted(
                    user.getFirstName(), user.getLastName(),
                    booking.getRoom().getType().name(),
                    booking.getRoom().getHotel().getCity(),
                    booking.getCheckIn(), booking.getCheckOut(),
                    booking.getTotalPrice());

            String aiMessage = callClaude(prompt, 250);

            // Envoyer l'email généré par l'IA
            emailService.sendAiGeneratedFollowUp(
                    user, aiMessage,
                    booking.getRoom().getHotel().getName());

        } catch (Exception e) {
            log.error("Erreur IA follow-up : {}", e.getMessage());
        }
    }

    // ─── RÔLE 4 : Chatbot client ─────────────────────────────
    public String chat(String userMessage, UUID userId,
                       List<Map<String, String>> conversationHistory) {

        // Construire l'historique de conversation
        List<Map<String, Object>> messages = new ArrayList<>();
        conversationHistory.forEach(m ->
                messages.add(Map.of(
                        "role", m.get("role"),
                        "content", m.get("content"))));
        messages.add(Map.of("role", "user", "content", userMessage));

        String systemPrompt = """
            Tu es un assistant hôtelier de LuxeStay au Maroc.
            Tu aides les clients à choisir leur chambre, répondre à leurs
            questions sur les hôtels, et résoudre leurs problèmes.
            Sois toujours poli, professionnel et en français.
            Si le client veut réserver, dis-lui d'utiliser le formulaire
            de réservation sur le site.
            """;

        return callClaudeWithSystem(systemPrompt, messages, 300);
    }

    private String callClaude(String prompt, int maxTokens) {
        try {
            Map<String, Object> body = Map.of(
                    "model", "llama-3.3-70b-versatile ", // Utilisez un modèle Groq valide
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt))
            );

            Map<?, ?> response = webClient.post()
                    .uri("/chat/completions") // Endpoint format OpenAI/Groq
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(15));

            // Lecture format OpenAI/Groq
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            log.error("Erreur API Groq : {}", e.getMessage());
            return "Service IA temporairement indisponible.";
        }
    }

    private String callClaudeWithSystem(String system, List<Map<String, Object>> messages, int maxTokens) {
        try {
            // Ajouter le message système au début de la liste des messages pour Groq
            List<Map<String, Object>> fullMessages = new ArrayList<>();
            fullMessages.add(Map.of("role", "system", "content", system));
            fullMessages.addAll(messages);

            Map<String, Object> body = Map.of(
                    "model", "llama-3.3-70b-versatile", // Modèle disponible sur Groq
                    "messages", fullMessages,
                    "max_tokens", maxTokens
            );

            Map<?, ?> response = webClient.post()
                    .uri("/chat/completions") // Endpoint correct pour Groq
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(15));

            // Extraction spécifique au format Groq/OpenAI
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");

            return (String) message.get("content");

        } catch (Exception e) {
            log.error("Erreur Groq : {}", e.getMessage());
            return "Je suis temporairement indisponible."; // C'est ce qui devrait être retourné
        }
    }
}