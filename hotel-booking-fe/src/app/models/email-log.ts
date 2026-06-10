// src/app/models/email-log.ts

export interface EmailLog {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: Date | string; // Optionnel : pour savoir quand l'email a été envoyé
  status?: 'SENT' | 'FAILED'; // Optionnel : pour suivre l'état de l'envoi
}
