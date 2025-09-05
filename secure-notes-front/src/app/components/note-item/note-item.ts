import { Component, inject, Input, signal } from '@angular/core';
import { Note } from '../../models/note';
import { EncryptionService } from '../../services/encryption-service';
import { Router } from '@angular/router';
import { Notes } from '../../services/notes';

@Component({
  selector: 'app-note-item',
  imports: [],
  templateUrl: './note-item.html',
  styleUrl: './note-item.css'
})
export class NoteItem {
 @Input({ required: true }) note!: Note;
  private encryption = inject(EncryptionService);
  private router = inject(Router);
  private noteService = inject(Notes);

  // Signals pour les données déchiffrées
  decryptedTitle = signal<string>('');
  decryptedContent = signal<string>('');
  isDecrypting = signal<boolean>(true);

  async ngOnInit() {
    await this.decryptNoteData();
  }

  private async decryptNoteData() {
    try {
      this.isDecrypting.set(true);
      
      const [title, content] = await Promise.all([
        this.encryption.decrypt(this.note.title || ''),
        this.encryption.decrypt(this.note.content || '')
      ]);
      
      this.decryptedTitle.set(title);
      this.decryptedContent.set(content);
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      // En cas d'erreur, utiliser les données originales
      this.decryptedTitle.set(this.note.title || 'Titre indisponible');
      this.decryptedContent.set(this.note.content || 'Contenu indisponible');
    } finally {
      this.isDecrypting.set(false);
    }
  }

  // Version synchrone pour la compatibilité (si nécessaire)
  decrypt(message: string): string {
    return this.encryption.decryptSync(message);
  }

  getContentPreview(): string {
    const content = this.decryptedContent();
    if (!content) return 'Aucun contenu...';
    
    // Supprime les balises HTML si présentes et limite à 150 caractères
    const cleanContent = content.replace(/<[^>]*>/g, '');
    return cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + '...'
      : cleanContent;
  }

  getFormattedDate(): string {
    if (!this.note.created_at) return '';
    
    const date = new Date(this.note.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Aujourd'hui";
    } else if (diffDays === 2) {
      return "Hier";
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays - 1} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  }

  getFullDate(): string {
    if (!this.note.created_at) return '';
    
    return new Date(this.note.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToEditNote() {
    this.router.navigate([`/note/${this.note.id}`]);
  }

  deleteNote(){

    this.noteService.deleteNote(this.note.id).subscribe({
      next: (res) => {
        alert('raffraichissez la page, vous avez supprimé la note avec succes')
      },
      error: (error) => {
        alert('erreur lors de la suppression de la note')
      }
    });

  }

}
