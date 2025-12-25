import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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

// Новые интерфейсы для теории
export interface TheorySectionResponse {
  id: string;
  topic: 'calculator' | 'sets' | 'matrices';
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface TheoryCreateRequest {
  topic: 'calculator' | 'sets' | 'matrices';
  title: string;
  content: string;
  order: number;
  isActive?: boolean;
}

export interface TheoryUpdateRequest {
  topic?: 'calculator' | 'sets' | 'matrices';
  title?: string;
  content?: string;
  order?: number;
  isActive?: boolean;
}

// Новые интерфейсы для тестов
export interface TestResponse {
  id: string;
  title: string;
  description: string;
  topic: string;
  questions: Question[];
  timeLimit: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer?: string;
}

export interface TestCreateRequest {
  title: string;
  description: string;
  topic: string;
  questions: Omit<Question, 'id'>[];
  timeLimit: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TestSubmission {
  testId: string;
  answers: string[];
  timeSpent: number;
}

export interface TestResult {
  score: number;
  correctCount: number;
  totalCount: number;
  resultId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Регистрация пользователя
  register(userData: RegisterRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      `${this.apiUrl}/auth/register`,
      userData,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Вход пользователя
  login(credentials: LoginRequest): Observable<ApiResponse<{ user: UserResponse; token: string }>> {
    return this.http.post<ApiResponse<{ user: UserResponse; token: string }>>(
      `${this.apiUrl}/auth/login`,
      credentials,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Получение текущего пользователя - ИСПРАВЛЕНО
  getCurrentUser(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(
      `${this.apiUrl}/auth/me`,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true // <-- ВАЖНО: включить отправку cookies/credentials
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Выход
  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/auth/logout`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Обновление AuthService для работы с реальным backend
  refreshAuth(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(
      `${this.apiUrl}/auth/refresh`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ========== НОВЫЕ МЕТОДЫ ДЛЯ ТЕОРИИ ==========

  // Получить все разделы теории (админ)
  getAllTheory(): Observable<ApiResponse<TheorySectionResponse[]>> {
    return this.http.get<ApiResponse<TheorySectionResponse[]>>(
      `${this.apiUrl}/theory`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Получить теорию по теме
  getTheoryByTopic(topic: string): Observable<ApiResponse<TheorySectionResponse[]>> {
    return this.http.get<ApiResponse<TheorySectionResponse[]>>(
      `${this.apiUrl}/theory/topic/${topic}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Создать раздел теории
  createTheorySection(section: TheoryCreateRequest): Observable<ApiResponse<TheorySectionResponse>> {
    return this.http.post<ApiResponse<TheorySectionResponse>>(
      `${this.apiUrl}/theory`,
      section
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Обновить раздел теории
  updateTheorySection(id: string, section: TheoryUpdateRequest): Observable<ApiResponse<TheorySectionResponse>> {
    return this.http.put<ApiResponse<TheorySectionResponse>>(
      `${this.apiUrl}/theory/${id}`,
      section
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Удалить раздел теории
  deleteTheorySection(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/theory/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ========== НОВЫЕ МЕТОДЫ ДЛЯ ТЕСТОВ ==========

  // Получить все тесты (админ)
  getAllTests(): Observable<ApiResponse<TestResponse[]>> {
    return this.http.get<ApiResponse<TestResponse[]>>(
      `${this.apiUrl}/tests`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Получить тесты по теме
  getTestsByTopic(topic: string): Observable<ApiResponse<TestResponse[]>> {
    return this.http.get<ApiResponse<TestResponse[]>>(
      `${this.apiUrl}/tests/topic/${topic}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Получить конкретный тест
  getTestById(id: string): Observable<ApiResponse<TestResponse>> {
    return this.http.get<ApiResponse<TestResponse>>(
      `${this.apiUrl}/tests/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Создать тест
  createTest(test: TestCreateRequest): Observable<ApiResponse<TestResponse>> {
    return this.http.post<ApiResponse<TestResponse>>(
      `${this.apiUrl}/tests`,
      test
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Обновить тест
  updateTest(id: string, test: Partial<TestCreateRequest>): Observable<ApiResponse<TestResponse>> {
    return this.http.put<ApiResponse<TestResponse>>(
      `${this.apiUrl}/tests/${id}`,
      test
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Удалить тест
  deleteTest(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/tests/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Отправить результаты теста
  submitTest(submission: TestSubmission): Observable<ApiResponse<TestResult>> {
    return this.http.post<ApiResponse<TestResult>>(
      `${this.apiUrl}/tests/${submission.testId}/submit`,
      submission
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ========== ОБРАБОТКА ОШИБОК ==========

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
