import { inject } from "@angular/core";
import { Route, Router, UrlSegment, UrlTree } from "@angular/router";
import { map, Observable, of } from "rxjs";
import { Auth } from "../services/auth";

export function redirectIfAuthenticated() : Observable<boolean | UrlTree> {
     const router = inject(Router); 
            const auth = inject(Auth);
            return auth.me().pipe(
            map(res => res.isAuthenticated
                ? router.createUrlTree(['/dashboard'])
                : true)
            );
}

export function redirectIfNotAuthenticated() : Observable<boolean | UrlTree> {
     const router = inject(Router); 
            const auth = inject(Auth);
            return auth.me().pipe(
            map(res => res.isAuthenticated
                ? true
                : router.createUrlTree(['/login']))
            );
}

export function redirectVerifyEmail(
  route: Route,  
  segments: UrlSegment[]
): Observable<boolean | UrlTree> {
  const router = inject(Router);
  const auth = inject(Auth);

  const token = segments[1]?.path; 

  if (!token) {
    return of(router.createUrlTree(['/email-error-verification']));
  }

  return auth.verifyEmail(token).pipe(
    map(res => res.valid
      ? router.createUrlTree(['/login'])
      : router.createUrlTree(['/email-error-verification']) 
    )
  );
}