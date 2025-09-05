import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Note } from '../../models/note';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Notes } from '../../services/notes';
import { EncryptionService } from '../../services/encryption-service';
import { NoteCreate } from '../../models/note.create';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-note',
  imports: [RouterLink, FormsModule],
  templateUrl: './edit-note.html',
  styleUrl: './edit-note.css'
})
export class EditNote {
 private router = inject(Router);
  private route = inject(ActivatedRoute);
  private noteService = inject(Notes);
  private encryption = inject(EncryptionService);

  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentTextarea') contentTextarea!: ElementRef<HTMLTextAreaElement>;

  noteId = signal<number | null>(null);
  noteTitle = signal('');
  noteContent = signal('');
  isLoading = signal(false);
  isLoadingNote = signal(true);
  lastModified = signal(new Date());
  originalNote: Note | null = null;
  
  // Pour stocker les versions originales déchiffrées
  originalDecryptedTitle = '';
  originalDecryptedContent = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.noteId.set(+id);
      this.loadNote();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit() {
    // Focus automatique sur le titre après le chargement des données
    if (!this.isLoadingNote()) {
      setTimeout(() => {
        this.titleInput?.nativeElement?.focus();
      }, 100);
    }
  }

  async loadNote() {
    const id = this.noteId();
    if (!id) return;

    this.isLoadingNote.set(true);
    
    this.noteService.getNote(id).subscribe({
      next: async (note: Note) => {
        try {
          this.originalNote = note;
          
          // Déchiffrer les données
          const [decryptedTitle, decryptedContent] = await Promise.all([
            this.encryption.decrypt(note.title || ''),
            this.encryption.decrypt(note.content || '')
          ]);
          
          // Stocker les versions déchiffrées
          this.originalDecryptedTitle = decryptedTitle;
          this.originalDecryptedContent = decryptedContent;
          
          // Mettre à jour les signals
          this.noteTitle.set(decryptedTitle);
          this.noteContent.set(decryptedContent);
          
          this.isLoadingNote.set(false);
          
          // Focus après chargement
          setTimeout(() => {
            if (this.titleInput) {
              this.titleInput.nativeElement.focus();
            }
          }, 100);
        } catch (error) {
          console.error('Erreur lors du déchiffrement:', error);
          // En cas d'erreur, utiliser les données originales
          this.noteTitle.set(note.title || '');
          this.noteContent.set(note.content || '');
          this.originalDecryptedTitle = note.title || '';
          this.originalDecryptedContent = note.content || '';
          this.isLoadingNote.set(false);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la note', error);
        this.isLoadingNote.set(false);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onTitleChange() {
    this.lastModified.set(new Date());
  }

  onContentChange() {
    this.lastModified.set(new Date());
    this.autoResize();
  }

  private autoResize() {
    const textarea = this.contentTextarea?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  getWordCount(): number {
    const text = (this.noteTitle() + ' ' + this.noteContent()).trim();
    return text ? text.split(/\s+/).length : 0;
  }

  getLastModified(): string {
    const now = this.lastModified();
    const today = new Date();
    
    if (now.toDateString() === today.toDateString()) {
      return `Modifié aujourd'hui à ${now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    return `Modifié le ${now.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`;
  }

  hasChanges(): boolean {
    return this.originalDecryptedTitle !== this.noteTitle() || 
           this.originalDecryptedContent !== this.noteContent();
  }

  async updateNote() {
    const id = this.noteId();
    if (!id || (!this.noteTitle().trim() && !this.noteContent().trim())) {
      return;
    }

    this.isLoading.set(true);
    
    try {
      // Chiffrer les nouvelles données
      const [encryptedTitle, encryptedContent] = await Promise.all([
        this.encryption.encrypt(this.noteTitle()),
        this.encryption.encrypt(this.noteContent())
      ]);

      const updatedNote: NoteCreate = {
        title: encryptedTitle,
        content: encryptedContent,
        owner_id: +localStorage.getItem("userId")!
      };
      
      console.log('Updating note with encrypted data:', updatedNote);
      
      this.noteService.updateNote(id, updatedNote).subscribe({
        next: (res) => {
          console.log('Note mise à jour avec succès', res);
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.isLoading.set(false);
          // Optionnel: afficher un message d'erreur à l'utilisateur
        }
      });
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      this.isLoading.set(false);
      // Optionnel: afficher un message d'erreur à l'utilisateur
    }
  }

  // Méthode pour sauvegarder en quittant si il y a des modifications
  async canDeactivate(): Promise<boolean> {
    if (this.hasChanges()) {
      const result = confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?');
      return result;
    }
    return true;
  }
}
