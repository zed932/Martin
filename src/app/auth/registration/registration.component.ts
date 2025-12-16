import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, this.noAdminInEmail]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  noAdminInEmail(control: AbstractControl): ValidationErrors | null {
    const email = control.value?.toLowerCase() || '';
    if (email.includes('admin')) {
      return { containsAdmin: true };
    }
    return null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { name, email, password } = this.registrationForm.value;

      this.authService.register({ name, email, password }).subscribe({
        next: (result) => {
          if (result.success) {
            this.successMessage = 'Регистрация успешна! Перенаправление...';
            // Автоматический вход после успешной регистрации
            setTimeout(() => {
              this.router.navigate(['/calculator']);
            }, 1500);
          } else {
            this.errorMessage = result.message;
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Ошибка при регистрации';
          this.isLoading = false;
        }
      });
    }
  }
}
