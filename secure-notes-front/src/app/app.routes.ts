import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Note } from './pages/note/note';
import { inject } from '@angular/core';
import { Auth } from './services/auth';
import { map } from 'rxjs';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {

            return inject(Auth).me().pipe(map((response) => {
                if(response.isAuthenticated) {
                    return '/dashboard'
                }
                else{
                    return '/login'
                }
            } ));
        }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path:'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
      
    },
    {
        path: 'notes/:id',
        loadComponent: () => import('./pages/note/note').then(m => m.Note),
    
    },
    {
        path: 'verify-email/:token',
        loadComponent: () => import('./pages/verify-email/verify-email').then(m => m.VerifyEmail)

    },
    {
        path: 'email-error-verification',
        loadComponent: () => import('./pages/email-error-verification/email-error-verification').then(m => m.EmailErrorVerification)
    },
    {
        path: '404',
        loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound)
    },
    {
        path: '**',
        redirectTo: '/404'
    }   
];
