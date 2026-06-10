import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.html',
  styleUrls: ['./star-rating.scss']
})
export class StarRatingComponent {
  @Input() stars: number = 0;      // Exemple: 4 ou 4.5
  @Input() showNumber: boolean = false;

  readonly starsArray = [1, 2, 3, 4, 5];

  /**
   * Identifie si une étoile doit être affichée comme "demie"
   * (utile si vous voulez un rendu précis pour 3.5, 4.5, etc.)
   */
  get halfStarIndex(): number {
    return (this.stars % 1 !== 0) ? Math.ceil(this.stars) : -1;
  }
}
