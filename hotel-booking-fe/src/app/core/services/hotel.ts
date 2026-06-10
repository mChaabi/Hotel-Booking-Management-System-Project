import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Hotel, Room, HotelSearchParams, Page }
  from '../../models/hotel';

@Injectable({ providedIn: 'root' })
export class HotelService {

  private http = inject(HttpClient);
  private api  = environment.apiUrl + '/hotels';

  // ── Recherche avec filtres ─────────────────────────────
  search(params: HotelSearchParams): Observable<Page<Hotel>> {
    let p = new HttpParams()
      .set('city',     params.city)
      .set('checkIn',  params.checkIn)
      .set('checkOut', params.checkOut)
      .set('guests',   params.guests.toString())
      .set('minStars', params.minStars.toString())
      .set('sortBy',   params.sortBy)
      .set('page',     params.page.toString())
      .set('size',     params.size.toString());

    if (params.maxPrice  != null)
      p = p.set('maxPrice',   params.maxPrice.toString());
    if (params.seaView)
      p = p.set('seaView',   'true');
    if (params.jacuzzi)
      p = p.set('jacuzzi',   'true');
    if (params.parking)
      p = p.set('parking',   'true');
    if (params.breakfast)
      p = p.set('breakfast', 'true');

    return this.http.get<Page<Hotel>>(
      `${this.api}/search`, { params: p }
    );
  }

  // ── Détail d'un hôtel ──────────────────────────────────
  getById(id: string): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.api}/${id}`);
  }

  // ── Chambres d'un hôtel ───────────────────────────────
  getRoomsByHotel(hotelId: string): Observable<Room[]> {
    return this.http.get<Room[]>(
      `${this.api}/${hotelId}/rooms`
    );
  }

  // ── Une chambre par ID ────────────────────────────────
  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(
      `${environment.apiUrl}/rooms/${roomId}`
    );
  }

  // Dans hotel.service.ts
getAllHotels(): Observable<Hotel[]> {
  return this.http.get<Hotel[]>(`${this.api}/hotels`);
}

  // ── Recommandation IA ────────────────────────────────
  getAiRecommendation(
    city: string, checkIn: string,
    checkOut: string, guests: number
  ): Observable<{ recommendation: string }> {
    const p = new HttpParams()
      .set('city',     city)
      .set('checkIn',  checkIn)
      .set('checkOut', checkOut)
      .set('guests',   guests.toString());

    return this.http.get<{ recommendation: string }>(
      `${this.api}/ai-recommendation`, { params: p }
    );
  }
}
