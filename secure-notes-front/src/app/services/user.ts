import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { BASE_URL } from '../constants/constants';
import { User } from '../models/user';
import { UserCreate } from '../models/user.create';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);

  updateUser(user_id: number,updateduser : UserCreate): Observable<User | null> {
    return this.http.put<User>(`${BASE_URL}/users/${user_id}`, updateduser, {observe: 'response'}).pipe(
      map(
        res => {
          if(res.status === 200){
            return res.body;
          }
          return null;
        }
      ),
      catchError(
        (error: HttpErrorResponse) => {
          console.error(error);
          return of(null);
        }
      )
    );
  }

  deleteUser(user_id : number): Observable<{message : string}> {
    return this.http.delete<{message: string}>(`${BASE_URL}/users/${user_id}`, {observe: 'response'}).pipe(
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


