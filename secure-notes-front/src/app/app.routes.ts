import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './services/auth';
import { map } from 'rxjs';
import { redirectIfAuthenticated, redirectIfNotAuthenticated, redirectVerifyEmail } from './redirections/auth-redirect';



export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: () => inject(Auth).me().pipe(map((response) => {
            if (response.isAuthenticated) {
                if(+localStorage.getItem("userId")! != response.user?.id || localStorage.getItem("userId") === null){
                    console.log(response.user?.id)
                    localStorage.removeItem("userId");
                    localStorage.setItem("userId",'' +  response.user?.id);
                }
                return '/dashboard';
            }else{
                return '/login';
            }
        }))
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
        path:'register',
        canMatch: [redirectIfAuthenticated],
        loadComponent: () => import('./pages/register/register').then(m => m.Register)
    },
    {
        path: 'profile',
        canMatch: [redirectIfNotAuthenticated],
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),  
    },
    {
        path: 'note/:id',
        canMatch: [redirectIfNotAuthenticated],
        loadComponent: () => import('./pages/edit-note/edit-note').then(m => m.EditNote),
    },
    {
        path: 'create-note',
        canMatch: [redirectIfNotAuthenticated],
        loadComponent: () => import('./pages/create-note/create-note').then(m => m.CreateNote)
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
