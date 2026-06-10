import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService }    from './core/services/auth';
import { NavbarComponent } from './modules/layout/navbar/navbar';
import { FooterComponent } from './modules/layout/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl:    './app.scss'
})
export class AppComponent {
  private auth = inject(AuthService);

  // Signal → true si token valide en localStorage
  isLoggedIn = computed(() => this.auth.isLoggedIn());
}
