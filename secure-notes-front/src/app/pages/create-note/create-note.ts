import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Notes } from '../../services/notes';
import { EncryptionService } from '../../services/encryption-service';
import { NoteCreate } from '../../models/note.create';

@Component({
  selector: 'app-create-note',
  imports: [RouterLink, FormsModule],
  templateUrl: './create-note.html',
  styleUrl: './create-note.css'
})
export class CreateNote {
  private router = inject(Router);
  private noteService = inject(Notes);
  private encryption = inject(EncryptionService);

  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentTextarea') contentTextarea!: ElementRef<HTMLTextAreaElement>;

  noteTitle = signal('');
  noteContent = signal('');
  isLoading = signal(false);
  lastModified = signal(new Date());

  ngAfterViewInit() {
    // Focus automatique sur le titre au chargement
    setTimeout(() => {
      this.titleInput.nativeElement.focus();
    }, 100);
  }

  onTitleChange() {
    this.lastModified.set(new Date());
  }

  onContentChange() {
    this.lastModified.set(new Date());
    this.autoResize();
  }

  private autoResize() {
    const textarea = this.contentTextarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
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

  async saveNote() {
    if (!this.noteTitle().trim() && !this.noteContent().trim()) {
      return;
    }

    this.isLoading.set(true);
    const encryptedTitle = await this.encryption.encrypt(this.noteTitle());
    const encryptedContent = await this.encryption.encrypt(this.noteContent());

    const newNote : NoteCreate = {
      title: encryptedTitle,
      content: encryptedContent,
      owner_id: +localStorage.getItem("userId")!
    } 
    
    console.log(newNote)
    this.noteService.createNote(newNote).subscribe({
      next:(res) => {
        console.log('creted successfully', res);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('error when creating note', error);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      }
    })
  }
}
