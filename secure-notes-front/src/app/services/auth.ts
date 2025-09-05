import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '../constants/constants';
import { Authenticated } from '../models/authenticated';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { LoginDetails } from '../models/login';
import { RegisterDetails } from '../models/register';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly http = inject(HttpClient);

  login(credentials : LoginDetails): Observable<{success: boolean, message: string}>{
    return this.http.post<{message?: string, error?: string}>(`${BASE_URL}/auth/login`, credentials, {
        observe: 'response', // pour accéder au status HTTP
      }).pipe(

        map(res => {
        if (res.status === 200 && res.body?.message) {
          return { success: true, message: res.body.message };
        }
        return { success: false, message: res.body?.error || 'Login failed' };
      }),
      catchError(err => {
        // gère les erreurs réseau ou HTTP 401/500
        const message = err.error?.error || 'Login failed';
        return of({ success: false, message });
      })
      );

  }

  register(credentials : RegisterDetails): Observable<{success: boolean, message: string}>{
    return this.http.post<{message?: string, error?:string}>(`${BASE_URL}/auth/register`, credentials, {
        observe: 'response', // pour accéder au status HTTP
      })
    .pipe(
      map(
        res => {
          if(res.status === 201 && res.body?.message){
            return {success: true, message: 'Register success !!'};
          }
          return {success: false, message: 'Register failed !!'};
        }
      ),
      catchError(
        error => {
          const message = error.error?.error || 'Register failed';
          return of({success: false, message:message})
        }
      )
    )
  }

  logout(): Observable<{success: boolean, message: string}>{
    return this.http.post<{message?: string, error?:string}>(`${BASE_URL}/auth/logout`,{}, {
        observe: 'response', // pour accéder au status HTTP
      }).pipe(
        map(
          res => {
            if(res.status === 200){
              return {message: 'Logout success !!', success: true}
            }
            return {message: 'Logout failed', success: false}
          }
        ),
        catchError(
          error => {
          const message = error.error?.error || 'Register failed';
          return of({success: false, message: message})
          }
        )
      )

  }

  me(): Observable<Authenticated> {
    return this.http.get<Authenticated>(`${BASE_URL}/users/me`, { 
    }).pipe(
      map(response => {
        console.log("response", response)
        if (response.isAuthenticated ) {
          return { isAuthenticated: true, user: response.user };
        }
        return { isAuthenticated: false, user: null };
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
