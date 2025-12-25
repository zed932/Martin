import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, TestResponse, TestResultResponse } from '../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-tests-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tests-list.component.html',
  styleUrls: ['./tests-list.component.css']
})
export class TestsListComponent implements OnInit {
  tests: TestResponse[] = [];
  filteredTests: any[] = []; // Изменим тип для хранения доп. данных
  userTestResults: TestResultResponse[] = []; // ДОБАВЬТЕ ЭТУ СТРОКУ
  isLoading = false;
  errorMessage = '';

  // Фильтры
  selectedTopic = 'all';
  selectedDifficulty = 'all';

  topics = [
    { value: 'all', label: 'Все темы' },
    { value: 'calculator', label: 'Калькулятор' },
    { value: 'sets', label: 'Теория множеств' },
    { value: 'matrices', label: 'Матрицы' },
    { value: 'algebra', label: 'Алгебра' },
    { value: 'geometry', label: 'Геометрия' }
  ];

  difficultyLevels = [
    { value: 'all', label: 'Все уровни' },
    { value: 'beginner', label: 'Начальный' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadTests();
    await this.loadUserResults();
  }

  async loadUserResults() {
    try {
      const response = await lastValueFrom(this.apiService.getUserTestResults());
      if (response.success) {
        this.userTestResults = response.data || [];
        this.filterTests(); // Обновляем фильтрацию после загрузки результатов
      }
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
    }
  }

  filterTests() {
    this.filteredTests = this.tests.map(test => {
      const userResult = this.userTestResults?.find((result: TestResultResponse) => result.testId === test.id);
      return {
        ...test,
        userScore: userResult?.score,
        isCompleted: !!userResult
      };
    }).filter(test => {
      const topicMatch = this.selectedTopic === 'all' || test.topic === this.selectedTopic;
      const difficultyMatch = this.selectedDifficulty === 'all' || test.difficulty === this.selectedDifficulty;
      return topicMatch && difficultyMatch;
    });
  }

  async loadTests() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await lastValueFrom(this.apiService.getAllTests());
      if (response.success) {
        this.tests = (response.data || [])
          .filter(test => test.isActive);
        this.filterTests(); // Используем новый метод фильтрации
      } else {
        this.errorMessage = response.message || 'Не удалось загрузить тесты';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Ошибка при загрузке тестов';
    } finally {
      this.isLoading = false;
    }
  }

  onTopicChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedTopic = select.value;
    this.filterTests();
  }

  onDifficultyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedDifficulty = select.value;
    this.filterTests();
  }

  getTopicName(topic: string): string {
    const topicMap = this.topics.find(t => t.value === topic);
    return topicMap?.label || topic;
  }

  getDifficultyName(difficulty: string): string {
    const diffMap = this.difficultyLevels.find(d => d.value === difficulty);
    return diffMap?.label || difficulty;
  }

  getQuestionCount(test: TestResponse): number {
    return test.questions?.length || 0;
  }

  startTest(testId: string) {
    this.router.navigate(['/test', testId]);
  }
}
