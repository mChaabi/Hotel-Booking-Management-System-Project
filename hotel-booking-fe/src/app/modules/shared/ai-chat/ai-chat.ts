import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../../core/services/ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.scss']
})
export class AiChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private aiService = inject(AiChatService);

  // Signaux d'état
  isOpen = signal(false);
  isTyping = signal(false);
  unread = signal(1); // Un message de bienvenue en attente
  messages = signal<ChatMessage[]>([]);

  inputText = '';
  history: Array<{ role: string; content: string }> = [];

  suggestions = [
    'Disponibilités à Tétouan ?',
    'Comment annuler ?',
    'Hôtels avec piscine ?',
    'Prix des suites ?'
  ];

  toggleChat() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.unread.set(0);
      this.scrollToBottom();
    }
  }

  sendMessage(text: string) {
    const message = text?.trim();
    if (!message || this.isTyping()) return;

    this.inputText = '';

    // 1. Ajouter le message utilisateur
    const userMsg: ChatMessage = { role: 'user', content: message, time: this.getTime() };
    this.messages.update(m => [...m, userMsg]);
    this.history.push({ role: 'user', content: message });

    this.isTyping.set(true);
    this.scrollToBottom();

    // 2. Appel au service IA
    this.aiService.chat(message, this.history).subscribe({
      next: (res) => {
        const botMsg: ChatMessage = { role: 'assistant', content: res, time: this.getTime() };
        this.messages.update(m => [...m, botMsg]);
        this.history.push({ role: 'assistant', content: res });
      },
      error: () => {
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: 'Oups, mon système est un peu fatigué. Réessayez ?',
          time: this.getTime()
        };
        this.messages.update(m => [...m, errMsg]);
      },
      complete: () => {
        this.isTyping.set(false);
        this.scrollToBottom();
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private getTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
