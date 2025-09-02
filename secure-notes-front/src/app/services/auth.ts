import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '../constants/constants';
import { Authenticated } from '../models/authenticated';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { response } from 'express';
import { error } from 'console';

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
          return of({ isAuthenticated: false, user: null } as Authenticated);
      })
    );
  }

  verifyEmail(token : string) : Observable<{valid: boolean}>{
    return this.http.get<{ message?: string; error?: string }>(`${BASE_URL}/auth/verify-email/${token}`).pipe(
      map(res => ({ valid: !!res.message })),
      catchError((error : HttpErrorResponse) => {
        console.error("Erreur lors de la vérification de l\'email", error);
        return of()
      })
    )
  }
  
}
