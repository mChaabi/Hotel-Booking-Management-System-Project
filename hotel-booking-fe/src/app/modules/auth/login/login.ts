import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup, FormControl, Validators
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl:    './login.scss'
})
export class LoginComponent {

  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  // ─── State ────────────────────────────────────────────
  loading  = signal(false);
  errorMsg = signal('');
  showPwd  = false;

  // ─── Formulaire ───────────────────────────────────────
  loginForm = new FormGroup({
    email:    new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
  });

  // ─── Vérifier champ invalide ──────────────────────────
  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ─── Soumettre ────────────────────────────────────────
  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.loginForm.value;

    this.auth.login({ email: email!, password: password! })
      .subscribe({
        next: () => {
          this.loading.set(false);
          // Rediriger vers l'URL demandée ou le dashboard
          const returnUrl =
            this.route.snapshot.queryParams['returnUrl']
            || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: err => {
          this.loading.set(false);
          if (err.status === 401) {
            this.errorMsg.set('Email ou mot de passe incorrect.');
          } else if (err.status === 0) {
            this.errorMsg.set(
              'Serveur inaccessible. Utilisez un accès démo.'
            );
          } else {
            this.errorMsg.set('Erreur de connexion. Réessayez.');
          }
        }
      });
  }

  // ─── Connexion démo (sans backend) ────────────────────
  loginDemo(role: 'admin' | 'guest') {
    this.auth.loginDemo(role);
  }
}
