import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { map } from 'rxjs';
import { UserService } from '../../services/user';
import { UserCreate } from '../../models/user.create';
import { error } from 'console';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
 private auth = inject(Auth);
 private router = inject(Router);
 private userService = inject(UserService);

  isEditingName = signal(false);
  isEditingEmail = signal(false);
  showDeleteConfirmation = signal(false);
  isLoading = signal(false);
  isLoadingUser = signal(true);
 

  currentUser: User | null | undefined;

  // Données utilisateur (simulées)
  userData = signal({
    name: '',
    email: '',
    memberSince: ''
  });

  // Formulaires réactifs
  nameForm: FormGroup;
  emailForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.nameForm = this.fb.group({
      name: [this.userData().name, [Validators.required, Validators.minLength(2)]]
    });

    this.emailForm = this.fb.group({
      email: [this.userData().email, [Validators.required, Validators.email]]
    });
  }

   ngOnInit() {
    this.loadUserData();
  }

  loadUserData(){
     this.isLoadingUser.set(true);

    this.auth.me().pipe(
      map(res => res.user)
    )
    .subscribe({
      next: (user) => {
        this.currentUser = user;
        this.updateUserData(user);
      },
      error: (error) => {
        console.error("error on get user", error);
      }
    });
  }
  private updateUserData(user: User | null ) {
    // Formatage de la date de création
    if(user != null){
      const memberSince = user.created_at 
      ? new Date(user.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : '';

    this.userData.set({
      name: user.name || '',
      email: user.email || '',
      memberSince: memberSince
    });
  }

    // Mise à jour des formulaires avec les vraies données
    this.nameForm.patchValue({ name: this.userData().name });
    this.emailForm.patchValue({ email: this.userData().email });
    
    this.isLoadingUser.set(false);
  }

  // Méthodes pour l'édition du nom
  startEditingName() {
    this.isEditingName.set(true);
    this.nameForm.patchValue({ name: this.userData().name });
  }

  cancelEditingName() {
    this.isEditingName.set(false);
    this.nameForm.patchValue({ name: this.userData().name });
  }

  saveName() {
    if (this.nameForm.valid) {
      this.isLoading.set(true);
      const newName = this.nameForm.get('name')?.value;

      if (this.currentUser) {
        const updatedUser : UserCreate = {
          name: newName,
          email: this.currentUser.email,
          hashed_password: this.currentUser.hashed_password
        }
        this.userService.updateUser(this.currentUser.id!, updatedUser).subscribe({
          next: (updatedUser) => {
               this.userData.update(data => ({ ...data, name: newName }));
               this.isEditingName.set(false);
               this.isLoading.set(false);
          },
          error:(error) => {
            console.error('Erreur lors de la mise à jour du nom:', error);
            this.isLoading.set(false);
            // Gérer l'erreur (affichage d'un message d'erreur par exemple)
          }
        });
      }
    }
  }


  // Méthodes pour l'édition de l'email
  startEditingEmail() {
    this.isEditingEmail.set(true);
    this.emailForm.patchValue({ email: this.userData().email });
  }

  cancelEditingEmail() {
    this.isEditingEmail.set(false);
    this.emailForm.patchValue({ email: this.userData().email });
  }

  saveEmail() {
    if (this.emailForm.valid) {
      this.isLoading.set(true);
      const newEmail = this.emailForm.get('email')?.value;

      if (this.currentUser) {
        const updatedUser : UserCreate = {
          name: this.currentUser.name!,
          email: newEmail,
          hashed_password: this.currentUser.hashed_password
        }
        this.userService.updateUser(this.currentUser.id!, updatedUser).subscribe({
          next: (updatedUser) => {
               this.userData.update(data => ({ ...data, email: newEmail }));
               this.isEditingEmail.set(false);
               this.isLoading.set(false);
          },
          error:(error) => {
            console.error('Erreur lors de la mise à jour du nom:', error);
            this.isLoading.set(false);
            // Gérer l'erreur (affichage d'un message d'erreur par exemple)
          }
        });
      }
    }
  }

  // Méthodes pour la suppression du compte
  showDeleteModal() {
    this.showDeleteConfirmation.set(true);
  }

  hideDeleteModal() {
    this.showDeleteConfirmation.set(false);
  }

  deleteAccount() {
   this.isLoading.set(true);
    
   this.userService.deleteUser(this.currentUser?.id!).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      }
   });

   this.router.navigate(['/']);
  }

  // Méthode de déconnexion
 logout(){
    this.auth.logout().subscribe({
      next: () => {
          localStorage.removeItem("userId");
          this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('logout error', error);
      }
    })
  }

  // Getters pour les erreurs de validation
  get nameError(): string | null {
    const control = this.nameForm.get('name');
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return 'Le nom est requis';
      if (control.errors['minlength']) return 'Le nom doit contenir au moins 2 caractères';
    }
    return null;
  }

  get emailError(): string | null {
    const control = this.emailForm.get('email');
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return 'L\'email est requis';
      if (control.errors['email']) return 'Format d\'email invalide';
    }
    return null;
  }

}
