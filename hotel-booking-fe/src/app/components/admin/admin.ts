import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking';
import { HotelService } from '../../core/services/hotel';
import { AiChatService } from '../../core/services/ai';
import { Hotel, Room, RoomImage } from '../../models/hotel';
import { Booking } from '../../models/booking';
import { EmailLog } from '../../models/email-log';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {
  private bookingService = inject(BookingService);
  private hotelService   = inject(HotelService);
  private aiService      = inject(AiChatService);

  // État de l'interface
  activeTab    = signal('dashboard');
  showRoomForm = signal(false);
  saving       = signal(false);
  sendingEmail = signal(false);
  searchTerm   = '';

  // Données
  hotels       = signal<Hotel[]>([]);
  bookings     = signal<Booking[]>([]);
  emailHistory = signal<EmailLog[]>([]);

  // IA Signals
  aiInsight         = signal('Chargement de l\'analyse IA...');
  analyticsAiReport = signal('');
  aiEmailPreview    = signal('');

  // Gestion des chambres
  editingRoom  = signal<Room | null>(null);
  roomImages   = signal<RoomImage[]>([]);

  navItems = [
    { id: 'dashboard',  label: 'Tableau de bord', icon: '📊' },
    { id: 'hotels',     label: 'Hôtels',          icon: '🏨' },
    { id: 'rooms',      label: 'Chambres',         icon: '🛏️' },
    { id: 'emails',     label: 'Emails',           icon: '📧' },
    { id: 'analytics',  label: 'Analytiques',      icon: '📈' },
  ];

  kpis = [
    { icon: '👤', label: 'Clients actifs',    value: '247', delta: '+12%', bg: '#E6F1FB', up: true },
    { icon: '📅', label: 'Réservations/jour', value: '47',  delta: '+8%',  bg: '#EAF3DE', up: true },
    { icon: '💰', label: 'Revenu (MAD)',       value: '182K', delta: '+24%', bg: '#FAEEDA', up: true },
    { icon: '⏳', label: 'En attente',         value: '12',   delta: 'À traiter', bg: '#FCEBEB', up: false },
  ];

  roomForm = new FormGroup({
    hotelId:         new FormControl('', Validators.required),
    roomNumber:      new FormControl('', Validators.required),
    type:            new FormControl('', Validators.required),
    capacity:        new FormControl(2, Validators.required),
    pricePerNight:   new FormControl(0, [Validators.required, Validators.min(1)]),
    roomSizeM2:      new FormControl(null),
    description:     new FormControl(''),
    wifi:            new FormControl(true),
    airConditioning: new FormControl(true),
    minibar:         new FormControl(false),
    jacuzzi:         new FormControl(false),
    seaView:         new FormControl(false),
    parking:         new FormControl(false),
    breakfast:       new FormControl(false),
  });

  emailForm = new FormGroup({
    targetGroup:   new FormControl('ALL'),
    specificEmail: new FormControl(''),
    subject:       new FormControl('', Validators.required),
    message:       new FormControl('', Validators.required),
    useAi:         new FormControl(false),
  });

  filteredBookings = computed(() => {
    const term = this.searchTerm.toLowerCase();
    return this.bookings().filter(b =>
      b.bookingReference.toLowerCase().includes(term) ||
      b.clientFirstName.toLowerCase().includes(term) ||
      b.hotelName.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadData();
    this.loadAiInsight();
  }

  loadData() {
    this.bookingService.getMyBookings().subscribe(b => this.bookings.set(b));
    this.hotelService.getAllHotels().subscribe(h => this.hotels.set(h));
  }

  setTab(id: string) { this.activeTab.set(id); }

  loadAiInsight() {
    this.aiService.chat('Analyse les données hôtelières et donne un conseil stratégique bref.', [])
      .subscribe({
        next: (r) => this.aiInsight.set(r),
        error: () => this.aiInsight.set("Impossible de charger l'analyse pour le moment.")
      });
  }

  generateAiEmail() {
    const msg = this.emailForm.value.message || '';
    if(!msg) return;
    this.aiService.chat(`Améliore ce message email hôtelier en français : "${msg}"`, [])
      .subscribe(r => this.aiEmailPreview.set(r));
  }

  saveRoom() {
    if (this.roomForm.invalid) return;
    this.saving.set(true);
    // Simulation d'appel API
    setTimeout(() => {
      this.saving.set(false);
      this.showRoomForm.set(false);
      this.roomForm.reset();
    }, 1500);
  }

  statusLabel(s: string) {
    const map: Record<string,string> = {
      CONFIRMED: '✅ Confirmée', PENDING: '⏳ En attente',
      CANCELLED: '❌ Annulée',  COMPLETED: '✔️ Terminée'
    };
    return map[s] ?? s;
  }

  // Méthodes de gestion (à implémenter selon tes besoins)
  refreshAiInsight()    { this.loadAiInsight(); }
  launchAiCampaign()    { this.setTab('emails'); }
  showAddRoom()          { this.showRoomForm.set(true); }
  cancelBooking(b: Booking) {
    this.bookingService.cancel(b.id).subscribe(() => this.loadData());
  }
}
