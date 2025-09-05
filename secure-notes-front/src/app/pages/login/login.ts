import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginDetails } from '../../models/login';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
private formBuilder = inject(FormBuilder);
private auth = inject(Auth);
private router = inject(Router);
  
  // Propriété pour gérer la visibilité du mot de passe
  showPassword = false;
  showConfirmPassword = false;
  
  // Formulaire de connexion avec validation
  loginForm : FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  // Getter pour accéder facilement aux contrôles du formulaire
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Méthode de soumission du formulaire
  onSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      
      const loginCredentials : LoginDetails = {
        email : formData.email,
        password : formData.password
      }

      this.auth.login(loginCredentials).subscribe();

      this.router.navigate(['/']);

    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.loginForm.markAllAsTouched();
    }
  }

  // Méthode pour obtenir le message d'erreur pour l'email
  getEmailErrorMessage() {
    if (this.email?.hasError('required')) {
      return 'L\'email est requis';
    }
    if (this.email?.hasError('email')) {
      return 'L\'email n\'est pas valide';
    }
    return '';
  }

  // Méthode pour obtenir le message d'erreur pour le mot de passe
  getPasswordErrorMessage() {
    if (this.password?.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    if (this.password?.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }
}
