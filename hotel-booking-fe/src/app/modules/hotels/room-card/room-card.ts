import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Room } from '../../../models/hotel';
import { StarRatingComponent } from '../../shared/star-rating/star-rating';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  templateUrl: './room-card.html',
  styleUrls: ['./room-card.scss']
})
export class RoomCardComponent {
  @Input({ required: true }) room!: Room;
  @Input() isRecommended = false;
  @Input() isNew = false;

  @Output() selected = new EventEmitter<Room>();
  @Output() favorited = new EventEmitter<Room>();

  isFavorite = false;

  onSelect(): void {
    this.selected.emit(this.room);
  }

  toggleFav(e: Event): void {
    e.stopPropagation(); // Empêche de déclencher le clic de la carte
    this.isFavorite = !this.isFavorite;
    this.favorited.emit(this.room);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'assets/images/room-default.jpg';
  }
}
