import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '../constants/constants';
import { Authenticated } from '../models/authenticated';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly http = inject(HttpClient);

  login(){

  }

  me(): Observable<Authenticated> {
    return this.http.get<Authenticated>(`${BASE_URL}/users/me`, { 
      withCredentials: true 
    }).pipe(
      tap(response => {
        console.log('Réponse d\'authentification:', response);
      }),
      catchError((error: HttpErrorResponse) => {
         console.error('Erreur lors de la vérification de l\'authentification:', error);
          return of({ isAuthenticated: false, user: null } as Authenticated);
      })
    );
  }
  
}
