import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './services/auth';
import { map } from 'rxjs';
import { redirectIfAuthenticated, redirectIfNotAuthenticated, redirectVerifyEmail } from './redirections/auth-redirect';



export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: () => inject(Auth).me().pipe(map((response) => response.isAuthenticated ? '/dashboard' : '/login'))
    },
    {
        path: 'dashboard',
        canMatch: [redirectIfNotAuthenticated],
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'login',
        canMatch: [redirectIfAuthenticated],
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'profile',
        canMatch: [redirectIfNotAuthenticated],
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),  
    },
    {
        path: 'notes/:id',
        canMatch: [redirectIfNotAuthenticated],
        loadComponent: () => import('./pages/note/note').then(m => m.Note),
    },
    {
        path: 'verify-email/:token',
        canMatch : [redirectVerifyEmail],
        loadComponent : () => import('./pages/verify-email/verify-email').then(m => m.VerifyEmail)
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
