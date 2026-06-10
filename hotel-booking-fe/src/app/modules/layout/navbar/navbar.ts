import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // État réactif basé sur le service Auth
  user = computed(() => this.auth.currentUser());

  // Calcul automatique des initiales (ex: "John Doe" -> "JD")
  initials = computed(() => {
    const u = this.user();
    if (!u?.firstName) return 'U';
    return ((u.firstName[0] || '') + (u.lastName?.[0] || '')).toUpperCase();
  });

  // États locaux pour l'UI
  dropOpen = signal(false);
  mobileOpen = signal(false);

  // Fermer le menu si on clique n'importe où ailleurs dans le document
  @HostListener('document:click')
  onDocClick() {
    this.dropOpen.set(false);
  }

  logout() {
    this.dropOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
