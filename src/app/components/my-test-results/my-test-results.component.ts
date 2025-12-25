import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, TestResultResponse } from '../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-test-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-test-results.component.html',
  styleUrls: ['./my-test-results.component.css']
})
export class MyTestResultsComponent implements OnInit {
  testResults: TestResultResponse[] = [];
  isLoading = false;
  errorMessage = '';

  // Статистика
  totalTestsTaken = 0;
  averageScore = 0;
  bestScore = 0;
  testsByTopic: { [key: string]: number } = {};

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.loadMyTestResults();
  }

  async loadMyTestResults() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await lastValueFrom(this.apiService.getUserTestResults());
      if (response.success) {
        this.testResults = response.data || [];
        this.calculateStatistics();
      } else {
        this.errorMessage = response.message || 'Не удалось загрузить результаты';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Ошибка при загрузке результатов';
    } finally {
      this.isLoading = false;
    }
  }

  calculateStatistics() {
    this.totalTestsTaken = this.testResults.length;

    if (this.totalTestsTaken > 0) {
      // Средний балл
      const totalScore = this.testResults.reduce((sum, result) => sum + result.score, 0);
      this.averageScore = Math.round(totalScore / this.totalTestsTaken);

      // Лучший результат
      this.bestScore = Math.max(...this.testResults.map(result => result.score));

      // Количество тестов по темам
      this.testsByTopic = {};
      this.testResults.forEach(result => {
        const topic = this.extractTopicFromTestTitle(result.testTitle);
        if (topic) {
          this.testsByTopic[topic] = (this.testsByTopic[topic] || 0) + 1;
        }
      });
    }
  }

  extractTopicFromTestTitle(title: string): string {
    const topics = ['Калькулятор', 'Множества', 'Матрицы', 'Алгебра', 'Геометрия'];
    for (const topic of topics) {
      if (title.toLowerCase().includes(topic.toLowerCase())) {
        return topic;
      }
    }
    return 'Другое';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTimeSpent(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getGradeColor(grade: string): string {
    switch (grade) {
      case 'Отлично': return '#2ecc71';
      case 'Хорошо': return '#3498db';
      case 'Удовлетворительно': return '#f39c12';
      case 'Неудовлетворительно': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 85) return '#2ecc71';
    if (score >= 70) return '#3498db';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  }
}
