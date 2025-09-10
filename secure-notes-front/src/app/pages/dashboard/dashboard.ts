import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from "../../components/navbar/navbar";
import { Notes } from '../../services/notes';
import { NoteItem } from '../../components/note-item/note-item';
import { Note } from '../../models/note';
import { delay } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, NoteItem, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private noteService = inject(Notes);
  notes : Note[] = [];
  isLoading = true;
  userId : number = +localStorage.getItem("userId")!;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.isLoading = true;
    this.noteService.getNotesByUser(this.userId)
     .pipe(
      delay(500) // délai en millisecondes, ici 2 secondes
    )
    .subscribe({
       next: (res) => {
          if (res && Array.isArray(res)) {
            this.notes = res.sort((a, b) => {
              const dateA = new Date(a.updated_at || a.created_at);
              const dateB = new Date(b.updated_at || b.created_at);
              return dateB.getTime() - dateA.getTime();
            });
            console.log('Sorted notes:', this.notes);
            console.log('Final notes length:', this.notes.length);
          } else {
            console.error('Response is not an array:', res);
            this.notes = [];
          }
       this.isLoading = false;
       console.log('my notes', this.notes);
       this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error when get user notes', error)
      }
    });
    
  }

}
