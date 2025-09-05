import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { BASE_URL } from '../constants/constants';
import { Note } from '../models/note';
import { NoteCreate } from '../models/note.create';

@Injectable({
  providedIn: 'root'
})
export class Notes {
  private readonly http = inject(HttpClient);

  getNotesByUser(user_id : number) : Observable<Note[]> {
    return this.http.get<Note[]>(`${BASE_URL}/notes/user_id/${user_id}`, {observe: 'response'}).pipe(
      map(
        res => {
          if(res.status === 200){
            return res.body ?? [];
          }
          return [];
        }
      ),
      catchError(
        (error: HttpErrorResponse) =>{
          console.error(error);
          return of([]);
        }
      )
    );
  }

getNote(note_id: number): Observable<Note> {
  return this.http.get<Note>(`${BASE_URL}/notes/${note_id}`, { observe: 'response' }).pipe(
    map(res => {
      if (res.status === 200 && res.body) {
        return res.body;
      }
      throw new Error('Note not found');
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('Error fetching note:', error);
      throw error; // Relance l'erreur pour que le composant puisse la gérer
    })
  );
}

  createNote(note : NoteCreate): Observable<Note | null> {
    return this.http.post<Note>(`${BASE_URL}/notes`, note, {observe: 'response'}).pipe(
      map(
        res => {
          if(res.status === 200){
            return res.body;
          }
          return null;
        }
      ),
      catchError(
        (error: HttpErrorResponse) =>{
          console.error(error);
          return of(null);
        }
      )
    );

  }

  updateNote(note_id: number, updatedNote : NoteCreate): Observable<Note | null> {
    return this.http.put<Note>(`${BASE_URL}/notes/${note_id}`, updatedNote, {observe: 'response'}).pipe(
      map(
        res => {
          if(res.status === 200){
            return res.body;
          }
          return null;
        }
      ),
      catchError(
        (error: HttpErrorResponse) =>{
          console.error(error);
          return of(null);
        }
      )
    );
  }

  deleteNote(note_id : number): Observable<{message : string}> {
    return this.http.delete<{message: string}>(`${BASE_URL}/notes/${note_id}`, {observe: 'response'}).pipe(
        map(
          res => {
            if(res.status === 200){
              return res.body!;
            }
            return {message: "Error when delete message"}
          }
        ),
        catchError(
          (error: HttpErrorResponse) =>{
            console.error(error);
            return of();
          }
        )
    );
  }
}
