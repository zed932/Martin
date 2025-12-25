import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, TestResponse } from '../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-tests-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tests-list.component.html',
  styleUrls: ['./tests-list.component.css']
})
export class TestsListComponent implements OnInit {
  tests: TestResponse[] = [];
  filteredTests: TestResponse[] = [];
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
  }

  async loadTests() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await lastValueFrom(this.apiService.getAllTests());
      if (response.success) {
        // Фильтруем только активные тесты для студентов
        this.tests = (response.data || [])
          .filter(test => test.isActive);
        this.filteredTests = [...this.tests];
      } else {
        this.errorMessage = response.message || 'Не удалось загрузить тесты';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Ошибка при загрузке тестов';
    } finally {
      this.isLoading = false;
    }
  }

  filterTests() {
    this.filteredTests = this.tests.filter(test => {
      const topicMatch = this.selectedTopic === 'all' || test.topic === this.selectedTopic;
      const difficultyMatch = this.selectedDifficulty === 'all' || test.difficulty === this.selectedDifficulty;
      return topicMatch && difficultyMatch;
    });
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
