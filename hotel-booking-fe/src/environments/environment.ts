// ─────────────────────────────────────────────────────────
// ENVIRONNEMENT DÉVELOPPEMENT
//
// Ce fichier est utilisé quand tu lances : ng serve
// Pour la production : ng build → utilise environment.prod.ts
// ─────────────────────────────────────────────────────────
export const environment = {
  production: false,

  // URL de ton backend Spring Boot
  // Assure-toi que Spring Boot tourne sur ce port
  apiUrl: 'http://localhost:8080/api/v1',

  // URL du frontend Angular
  appUrl: 'http://localhost:4200',
};
