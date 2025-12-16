import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService, TestResponse } from '../../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-test-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-management.component.html',
  styleUrls: ['./test-management.component.css']
})
export class TestManagementComponent implements OnInit {
  showAddTestForm = false;
  testForm: FormGroup;
  tests: TestResponse[] = [];
  isLoading = false;
  errorMessage = '';

  topics = [
    { value: 'calculator', label: 'Калькулятор' },
    { value: 'sets', label: 'Теория множеств' },
    { value: 'matrices', label: 'Матрицы' },
    { value: 'algebra', label: 'Алгебра' },
    { value: 'geometry', label: 'Геометрия' }
  ];

  difficultyLevels = [
    { value: 'beginner', label: 'Начальный' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.testForm = this.fb.group({
      title: ['', Validators.required],
      topic: ['', Validators.required],
      description: ['', Validators.required],
      difficulty: ['beginner', Validators.required],
      timeLimit: [30, [Validators.required, Validators.min(5), Validators.max(180)]]
    });
  }

  async ngOnInit() {
    await this.loadTests();
  }

  async loadTests() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await lastValueFrom(this.apiService.getAllTests());
      if (response.success) {
        this.tests = response.data || [];
      } else {
        this.errorMessage = response.message || 'Не удалось загрузить тесты';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Ошибка при загрузке тестов';
    } finally {
      this.isLoading = false;
    }
  }

  async createTest() {
    if (this.testForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        // Создаем тест с одним примерным вопросом
        const testData = {
          ...this.testForm.value,
          questions: [{
            text: 'Пример вопроса',
            type: 'single' as const,
            options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
            correctAnswer: '0'
          }]
        };

        const response = await lastValueFrom(this.apiService.createTest(testData));
        if (response.success && response.data) {
          await this.loadTests(); // Перезагружаем список тестов
          this.testForm.reset({
            difficulty: 'beginner',
            timeLimit: 30
          });
          this.showAddTestForm = false;
        } else {
          this.errorMessage = response.message || 'Не удалось создать тест';
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Ошибка при создании теста';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
      // Помечаем все поля как "touched" для отображения ошибок
      Object.keys(this.testForm.controls).forEach(key => {
        const control = this.testForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  async deleteTest(id: string) {
    if (confirm('Вы уверены, что хотите удалить этот тест?')) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const response = await lastValueFrom(this.apiService.deleteTest(id));
        if (response.success) {
          await this.loadTests(); // Перезагружаем список тестов
        } else {
          this.errorMessage = response.message || 'Не удалось удалить тест';
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Ошибка при удалении теста';
      } finally {
        this.isLoading = false;
      }
    }
  }

  getTopicName(topic: string): string {
    const topicMap = this.topics.find(t => t.value === topic);
    return topicMap?.label || topic;
  }

  getDifficultyName(difficulty: string): string {
    const diffMap = this.difficultyLevels.find(d => d.value === difficulty);
    return diffMap?.label || difficulty;
  }

  // Вспомогательные методы для валидации формы
  get title() { return this.testForm.get('title'); }
  get topic() { return this.testForm.get('topic'); }
  get description() { return this.testForm.get('description'); }
  get timeLimit() { return this.testForm.get('timeLimit'); }
}
