// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Регистрация пользователя
  register(userData: RegisterRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      `${this.apiUrl}/auth/register`,
      userData
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Вход пользователя
  login(credentials: LoginRequest): Observable<ApiResponse<{ user: UserResponse; token: string }>> {
    return this.http.post<ApiResponse<{ user: UserResponse; token: string }>>(
      `${this.apiUrl}/auth/login`,
      credentials
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Получение текущего пользователя
  getCurrentUser(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(
      `${this.apiUrl}/auth/me`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Выход
  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/auth/logout`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Обновление AuthService для работы с реальным backend
  refreshAuth(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/auth/refresh`).pipe(
      catchError(this.handleError)
    );
  }

  // Обработка ошибок
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Произошла ошибка. Пожалуйста, попробуйте позже.';

    if (error.error instanceof ErrorEvent) {
      // Клиентская ошибка
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      // Серверная ошибка
      switch (error.status) {
        case 400:
          errorMessage = 'Некорректные данные';
          break;
        case 401:
          errorMessage = 'Неавторизованный доступ';
          break;
        case 403:
          errorMessage = 'Доступ запрещен';
          break;
        case 404:
          errorMessage = 'Ресурс не найден';
          break;
        case 409:
          errorMessage = 'Пользователь с таким email уже существует';
          break;
        case 500:
          errorMessage = 'Внутренняя ошибка сервера';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
