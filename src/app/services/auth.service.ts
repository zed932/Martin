import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, UserResponse } from './api.service';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<UserResponse | null>(null);
  private isLoggedInSignal = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.checkAuth();
  }

  private checkAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.apiService.getCurrentUser().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUser.set(response.data);
            this.isLoggedInSignal.set(true);
          } else {
            this.clearAuth();
          }
        },
        error: () => {
          this.clearAuth();
        }
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService.login({ email, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('token', response.data.token);
          this.currentUser.set(response.data.user);
          this.isLoggedInSignal.set(true);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({ success: false, message: error.message });
      })
    );
  }

  register(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.apiService.register(userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          // После успешной регистрации автоматически входим
          const { email, password } = userData;
          this.login(email, password).subscribe();
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return of({ success: false, message: error.message });
      })
    );
  }

  logout(): Observable<any> {
    return this.apiService.logout().pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return of({ success: false, message: 'Ошибка при выходе' });
      })
    );
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.isLoggedInSignal.set(false);
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUser();
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSignal();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isStudent(): boolean {
    return this.currentUser()?.role === 'student';
  }

  quickLogin(role: 'admin' | 'student'): void {
    const demoCredentials = {
      admin: { email: 'admin@edu.ru', password: 'admin123' },
      student: { email: 'student@edu.ru', password: 'student123' }
    };

    this.login(demoCredentials[role].email, demoCredentials[role].password).subscribe();
  }
}
