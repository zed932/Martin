import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, TestResponse, Question, TestCreateRequest, TestResultResponse } from '../../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-test-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.css']
})
export class TestResultsComponent implements OnInit {
  testResults: TestResultResponse[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.loadTestResults();
  }

  async loadTestResults() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await lastValueFrom(this.apiService.getAllTestResults());
      if (response.success) {
        this.testResults = response.data || [];
      } else {
        this.errorMessage = response.message || 'Не удалось загрузить результаты';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Ошибка при загрузке результатов';
    } finally {
      this.isLoading = false;
    }
  }

  // Добавьте эти методы
  filterResults(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    // Фильтрация будет добавлена позже
  }

  exportResults() {
    // Экспорт будет добавлен позже
    alert('Экспорт результатов в разработке');
  }

  get totalTests(): number {
    return this.testResults.length;
  }

  get averageScore(): string {
    if (this.testResults.length === 0) return '0';
    const total = this.testResults.reduce((sum, result) => sum + result.score, 0);
    const average = total / this.testResults.length;
    return average.toFixed(1);
  }

  get bestScore(): string {
    if (this.testResults.length === 0) return '0';
    const best = Math.max(...this.testResults.map(result => result.score));
    return best.toFixed(1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU');
  }

  formatTimeSpent(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Получить имя пользователя из результата
  getUserName(result: TestResultResponse): string {
    // В реальном приложении здесь должна быть логика получения имени пользователя
    return `Пользователь ${result.userId}`;
  }

  // Получить email пользователя
  getUserEmail(result: TestResultResponse): string {
    // В реальном приложении здесь должна быть логика получения email
    return `user${result.userId}@example.com`;
  }

  // Получить название теста
  getTestName(result: TestResultResponse): string {
    return result.testTitle || `Тест ${result.testId}`;
  }
}
