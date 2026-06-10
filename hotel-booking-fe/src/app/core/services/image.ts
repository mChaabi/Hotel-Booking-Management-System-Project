import { HttpClient, HttpEventType } from '@angular/common/http';
import { inject, Injectable, WritableSignal } from '@angular/core';
import { RoomImage } from '../../models/hotel';
import { filter, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ImageService {

  private http = inject( HttpClient);
  private api  = environment.apiUrl + '/rooms';

  upload(roomId: string, file: File,
         item: any, queue: WritableSignal<any[]>
  ): Observable<RoomImage> {

    const form = new FormData();
    form.append('file', file);
    form.append('isPrimary', 'false');

    return this.http.post<RoomImage>(
      `${this.api}/${roomId}/images`, form, {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          item.progress = Math.round(
            100 * event.loaded / (event.total || 1));
          queue.update(q => [...q]);
        }
        if (event.type === HttpEventType.Response) {
          queue.update(q => q.filter(i => i !== item));
          return event.body as RoomImage;
        }
        return null as any;
      }),
      filter(r => r !== null)
    );
  }

  getRoomImages(roomId: string): Observable<RoomImage[]> {
    return this.http.get<RoomImage[]>(
      `${this.api}/${roomId}/images`);
  }

  delete(imageId: string, roomId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/${roomId}/images/${imageId}`);
  }
}
