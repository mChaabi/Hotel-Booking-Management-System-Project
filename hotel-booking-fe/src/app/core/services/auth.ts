import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

// ── Types ──────────────────────────────────────────────────
export type UserRole = 'GUEST' | 'USER' | 'ADMIN' | 'RECEPTIONIST';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private api    = environment.apiUrl + '/auth';

  // 1. Injecter l'ID de plateforme
  private platformId = inject(PLATFORM_ID);

  // 2. Initialiser le signal à null par défaut
  currentUser = signal<User | null>(null);


  constructor() {
    // 3. Charger l'utilisateur UNIQUEMENT si on est dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.currentUser.set(this.loadUser());
    }
  }

  // ── Computed ───────────────────────────────────────────
  isAdmin = computed(() =>
    this.currentUser()?.role === 'ADMIN'
  );

  // ── LOGIN ──────────────────────────────────────────────
  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, req)
      .pipe(
        tap(res => {
          // Sauvegarder en localStorage
          localStorage.setItem('token',        res.token);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('user',         JSON.stringify(res.user));
          // Mettre à jour le signal
          this.currentUser.set(res.user);
        })
      );
  }

  // ── REGISTER ───────────────────────────────────────────
  register(req: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, req)
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user',  JSON.stringify(res.user));
          this.currentUser.set(res.user);
        })
      );
  }

 logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

 // 5. Sécuriser aussi getToken et logout (car ils utilisent localStorage)
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    // Connecté si token existe ET user chargé
    const token = this.getToken();
    const user  = this.currentUser();
    return !!token && !!user;
  }

  // ── Chargement initial depuis localStorage ─────────────
  private loadUser(): User | null {
    // 4. Protection supplémentaire à l'intérieur de la méthode
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  // ── Simulation login pour démo (sans backend) ──────────
  loginDemo(role: 'admin' | 'guest'): void {
    const demoUsers: Record<string, User> = {
      admin: {
        id: 'demo-admin-001',
        firstName: 'Ahmed',
        lastName: 'Admin',
        email: 'admin@luxestay.ma',
        role: 'ADMIN',
        loyaltyPoints: 1500,
        isActive: true
      },
      guest: {
        id: 'demo-guest-001',
        firstName: 'Youssef',
        lastName: 'Amrani',
        email: 'youssef@test.ma',
        role: 'GUEST',
        loyaltyPoints: 350,
        isActive: true
      }
    };

    const user = demoUsers[role];
    const fakeToken = 'demo-jwt-token-' + Date.now();

    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user',  JSON.stringify(user));
    this.currentUser.set(user);
    this.router.navigate(['/dashboard']);
  }
}
