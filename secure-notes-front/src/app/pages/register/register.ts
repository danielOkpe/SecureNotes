import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Auth } from '../../services/auth';
import { RegisterDetails } from '../../models/register';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router)

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  step: number = 0;

  registerForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  // Validation de la force du mot de passe
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors: any = {};
    if (!hasUpperCase) errors.uppercase = true;
    if (!hasLowerCase) errors.lowercase = true;
    if (!hasNumber) errors.number = true;
    if (!hasSpecialChar) errors.specialChar = true;
    
    return Object.keys(errors).length ? { passwordStrength: errors } : null;
  }

  // Validation que les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Getters pour accéder aux contrôles
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  // Vérifier si on peut passer à l'étape suivante
  canGoToNextStep(): boolean | undefined {
    switch (this.step) {
      case 0:
        return this.name?.valid || false;
      case 1:
        return this.email?.valid || false;
      case 2:
        return this.password?.valid && this.confirmPassword?.valid && !this.registerForm.hasError('passwordMismatch');
      default:
        return false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  nextStep() {
    if (this.canGoToNextStep() && this.step < 2) {
      this.step++;
    }
  }

  previousStep() {
    if (this.step > 0) {
      this.step--;
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const registerCredentials : RegisterDetails = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.auth.register(registerCredentials).subscribe();

      this.router.navigate(['/'])
      
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  // Messages d'erreur
  getNameErrorMessage() {
    if (this.name?.hasError('required')) return 'Le nom est requis';
    if (this.name?.hasError('minlength')) return 'Le nom doit contenir au moins 2 caractères';
    return '';
  }

  getEmailErrorMessage() {
    if (this.email?.hasError('required')) return 'L\'email est requis';
    if (this.email?.hasError('email')) return 'L\'email n\'est pas valide';
    return '';
  }

  getPasswordErrorMessage() {
    if (this.password?.hasError('required')) return 'Le mot de passe est requis';
    if (this.password?.hasError('minlength')) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (this.password?.hasError('passwordStrength')) {
      const errors = this.password.errors?.['passwordStrength'];
      const missing = [];
      if (errors.uppercase) missing.push('une majuscule');
      if (errors.lowercase) missing.push('une minuscule');
      if (errors.number) missing.push('un chiffre');
      if (errors.specialChar) missing.push('un caractère spécial');
      return `Le mot de passe doit contenir ${missing.join(', ')}`;
    }
    return '';
  }

  getConfirmPasswordErrorMessage() {
    if (this.confirmPassword?.hasError('required')) return 'Veuillez confirmer le mot de passe';
    if (this.registerForm.hasError('passwordMismatch')) return 'Les mots de passe ne correspondent pas';
    return '';
  }
}
