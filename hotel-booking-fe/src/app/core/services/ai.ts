import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiChatService {

  private http = inject(HttpClient);
  private api  = environment.apiUrl + '/ai';

  // ── Chat avec l'IA ────────────────────────────────────
  chat(
    message: string,
    history: Array<{ role: string; content: string }>
  ): Observable<string> {
    return this.http
      .post<{ response: string }>(
        `${this.api}/chat`,
        { message, history }
      )
      .pipe(
        map(r => r.response),
        catchError(() =>
          // Réponses démo si backend absent
          of(this.demoResponse(message))
        )
      );
  }

  // ── Réponses de démo sans backend ─────────────────────
  private demoResponse(msg: string): string {
    const m = msg.toLowerCase();

    if (m.includes('tétouan') || m.includes('tetouan'))
      return 'À Tétouan, je recommande le Barceló (4⭐) avec vue sur la médina, ou le Grand Hôtel avec piscine. Forte demande en mai — réservez vite !';

    if (m.includes('marrakech'))
      return 'Marrakech offre des riads magnifiques. Le Riad Salam est idéal pour une immersion authentique dès 760 MAD/nuit.';

    if (m.includes('prix') || m.includes('tarif'))
      return 'Nos tarifs : Chambre Double dès 580 MAD, Deluxe dès 760 MAD, Junior Suite dès 1 100 MAD, Suite dès 1 850 MAD/nuit.';

    if (m.includes('annul'))
      return 'Pour annuler : allez dans "Mes réservations", cliquez sur votre réservation puis "Annuler". Le remboursement est sous 5-7 jours.';

    if (m.includes('piscine'))
      return 'Hôtels avec piscine : Mazagan Beach (3 piscines ⭐⭐⭐⭐⭐), Barceló Tétouan (piscine panoramique ⭐⭐⭐⭐), Sofitel Fès (piscine chauffée ⭐⭐⭐⭐⭐).';

    if (m.includes('recommend') || m.includes('conseil') || m.includes('suggest'))
      return 'Basé sur votre profil, je recommande la Suite Royale du Mazagan Beach Resort — vue océan, jacuzzi, petit-déjeuner inclus. Rapport qualité-prix exceptionnel !';

    return 'Je suis votre assistant LuxeStay. Je peux vous aider à choisir une chambre, vérifier les disponibilités, ou répondre à vos questions. Posez-moi votre question !';
  }
}
