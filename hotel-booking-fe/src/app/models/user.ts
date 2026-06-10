// ─────────────────────────────────────────────────────────
// MODÈLE USER — correspond à l'entité User.java du backend
// ─────────────────────────────────────────────────────────

export type UserRole = 'GUEST' | 'ADMIN' | 'HOTEL_MANAGER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
}

// Ce que l'API retourne quand on se connecte
export interface AuthResponse {
  token: string;       // JWT token
  refreshToken: string;
  user: User;
  expiresIn: number;   // durée en millisecondes
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}
