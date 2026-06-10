import { Component, Input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../core/services/image';


export interface RoomImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
}

interface UploadItem {
  name: string;
  progress: number;
}

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.html',
  styleUrls: ['./image-gallery.scss']
})
export class ImageGalleryComponent {
  // Entrées
  @Input() set roomImages(imgs: RoomImage[]) {
    this.images.set(imgs && imgs.length > 0 ? imgs : [this.defaultImage]);
  }
  @Input() isAdmin = false;
  @Input() roomId = '';

  private imageService = inject(ImageService);

  // État de la Galerie
  images = signal<RoomImage[]>([this.defaultImage]);
  currentIndex = signal(0);
  lightboxOpen = signal(false);

  // État de l'Upload
  isDragging = signal(false);
  uploadQueue = signal<UploadItem[]>([]);

  get defaultImage(): RoomImage {
    return {
      id: '',
      imageUrl: '/assets/room-default.jpg',
      isPrimary: true,
      displayOrder: 0,
      altText: 'Image par défaut'
    };
  }

  // Signal calculé pour l'image active
  currentImage = computed(() => this.images()[this.currentIndex()]);

  // Actions Navigation
  next(e?: Event) {
    e?.stopPropagation();
    this.currentIndex.update(i => (i + 1) % this.images().length);
  }

  prev(e?: Event) {
    e?.stopPropagation();
    this.currentIndex.update(i => i === 0 ? this.images().length - 1 : i - 1);
  }

  setIndex(i: number) {
    this.currentIndex.set(i);
  }

  // Lightbox
  openLightbox(i: number) {
    this.currentIndex.set(i);
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  // Gestion Drag & Drop
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files || []);
    this.uploadFiles(files);
  }

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.uploadFiles(files);
  }

  // Logique d'Upload
  private uploadFiles(files: File[]) {
    files.forEach(file => {
      const item: UploadItem = { name: file.name, progress: 0 };
      this.uploadQueue.update(q => [...q, item]);

      this.imageService.upload(this.roomId, file, item, this.uploadQueue)
        .subscribe({
          next: (newImg: RoomImage | undefined) => {
            if (newImg) {
              this.images.update(imgs => [...imgs, newImg]);
            }
          },
          error: (err) => console.error('Upload failed', err)
        });
    });
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = '/assets/room-default.jpg';
  }
}
