import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ApiService, TestResponse } from '../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="test-container">
      @if (isLoading) {
        <div class="loading">Загрузка теста...</div>
      } @else if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
        <button (click)="goBack()" class="btn-back">Вернуться назад</button>
      } @else if (test) {
        <div class="test-header">
          <h3>{{ test.title }}</h3>
          <div class="test-info">
            <span>Вопросов: {{ test.questions.length || 0 }}</span>
            <span>Время: {{ test.timeLimit }} минут</span>
            <span>Сложность: {{ getDifficultyName(test.difficulty) }}</span>
          </div>
          <div class="timer" *ngIf="timeLeft > 0">
            Осталось времени: {{ formatTime(timeLeft) }}
          </div>
        </div>

        <div class="test-description">
          <p>{{ test.description }}</p>
        </div>

        <form [formGroup]="testForm" (ngSubmit)="submitTest()">
          <div class="questions-section">
            @for (question of test.questions || []; track question.id; let i = $index) {
              <div class="question-item">
                <div class="question-text">
                  <h5>Вопрос {{ i + 1 }}:</h5>
                  <p>{{ question.text }}</p>
                </div>

                <div class="question-options">
                  @if (question.type === 'single') {
                    <div class="single-options">
                      @for (option of question.options || []; track $index; let j = $index) {
                        <label class="option-label">
                          <input
                            type="radio"
                            [formControlName]="'question_' + i"
                            [value]="j.toString()"
                            name="question{{i}}">
                          {{ option }}
                        </label>
                      }
                    </div>
                  } @else if (question.type === 'multiple') {
                    <div class="multiple-options">
                      @for (option of question.options || []; track $index; let j = $index) {
                        <label class="option-label">
                          <input
                            type="checkbox"
                            [value]="j"
                            (change)="onCheckboxChange($event, i)">
                          {{ option }}
                        </label>
                      }
                    </div>
                  } @else if (question.type === 'text') {
                    <textarea
                      [formControlName]="'question_' + i"
                      class="form-control"
                      rows="3"
                      placeholder="Введите ваш ответ"></textarea>
                  }
                </div>
              </div>
            }
          </div>

          <div class="test-actions">
            <button type="submit" class="btn-submit" [disabled]="isSubmitting">
              @if (isSubmitting) {
                <span class="spinner"></span>
              }
              Завершить тест
            </button>
            <button type="button" class="btn-cancel" (click)="goBack()">Отмена</button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .test-header {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .test-info {
      display: flex;
      gap: 20px;
      margin: 10px 0;
      color: #6c757d;
    }
    .timer {
      background: #007bff;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
    }
    .test-description {
      background: #e9ecef;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .question-item {
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
      background: white;
    }
    .question-text h5 {
      margin-bottom: 10px;
    }
    .option-label {
      display: block;
      padding: 10px;
      margin: 5px 0;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
    }
    .option-label:hover {
      background: #f8f9fa;
    }
    .option-label input[type="radio"],
    .option-label input[type="checkbox"] {
      margin-right: 10px;
    }
    .test-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
    }
    .btn-submit {
      background: #28a745;
      color: white;
      border: none;
      padding: 10px 30px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .btn-submit:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    .btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 30px;
      border-radius: 4px;
      cursor: pointer;
    }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading, .error {
      text-align: center;
      padding: 40px;
      font-size: 18px;
    }
    .error {
      color: #dc3545;
    }
    .btn-back {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      display: block;
      margin: 20px auto;
    }
  `]
})
export class TestComponent implements OnInit, OnDestroy {
  test: TestResponse | null = null;
  testForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  timeLeft = 0;
  timerInterval: any;

  difficultyLevels = [
    { value: 'beginner', label: 'Начальный' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.testForm = this.fb.group({});
  }

  async ngOnInit() {
    const testId = this.route.snapshot.paramMap.get('id');
    if (testId) {
      await this.loadTest(testId);
    }
  }

  async loadTest(testId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await lastValueFrom(this.apiService.getTestById(testId));
      if (response.success && response.data) {
        this.test = response.data;
        this.initializeForm();
        this.startTimer();
      } else {
        this.errorMessage = response.message || 'Тест не найден';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Ошибка при загрузке теста';
    } finally {
      this.isLoading = false;
    }
  }

  initializeForm() {
    if (!this.test?.questions) return;

    // Очищаем форму
    const controls: {[key: string]: FormControl} = {};

    // Добавляем контролы для каждого вопроса
    this.test.questions.forEach((question, index) => {
      controls[`question_${index}`] = this.fb.control('');
    });

    this.testForm = this.fb.group(controls);
  }

  onCheckboxChange(event: Event, questionIndex: number) {
    const checkbox = event.target as HTMLInputElement;
    const currentControl = this.testForm.get(`question_${questionIndex}`);
    if (!currentControl) return;

    let currentValues = currentControl.value?.split(',') || [];
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      const index = currentValues.indexOf(value);
      if (index > -1) {
        currentValues.splice(index, 1);
      }
    }

    currentControl.setValue(currentValues.join(','));
  }

  startTimer() {
    if (this.test?.timeLimit) {
      this.timeLeft = this.test.timeLimit * 60; // Конвертируем минуты в секунды
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.submitTest();
        }
      }, 1000);
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getDifficultyName(difficulty: string): string {
    const diffMap = this.difficultyLevels.find(d => d.value === difficulty);
    return diffMap?.label || difficulty;
  }

  // В test.component.ts добавьте этот метод:
  normalizeAnswers(answers: any[]): string[] {
    return answers.map(answer => {
      if (answer === null || answer === undefined) return '';
      // Конвертируем числа в строки для single вопросов
      if (typeof answer === 'number') return answer.toString();
      // Убираем лишние запятые для multiple вопросов
      if (typeof answer === 'string' && answer.includes(',')) {
        return answer.split(',')
          .map(a => a.trim())
          .filter(Boolean)
          .sort()
          .join(',');
      }
      return answer.toString();
    });
  }

// Измените метод submitTest():
  async submitTest() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.isSubmitting = true;
    const timeSpent = this.test?.timeLimit ? (this.test.timeLimit * 60) - this.timeLeft : 0;

    try {
      if (!this.test) {
        throw new Error('Тест не загружен');
      }

      if (!this.test.id) {
        throw new Error('ID теста не найден');
      }

      // Собираем ответы
      const rawAnswers: any[] = [];
      for (let i = 0; i < (this.test.questions?.length || 0); i++) {
        const control = this.testForm.get(`question_${i}`);
        rawAnswers.push(control?.value || '');
      }

      // НОРМАЛИЗУЕМ ОТВЕТЫ
      const normalizedAnswers = this.normalizeAnswers(rawAnswers);

      console.log('Отправка теста:', {
        testId: this.test.id,
        rawAnswers,
        normalizedAnswers,
        timeSpent: Math.floor(timeSpent)
      });

      const submission = {
        testId: this.test.id,
        answers: normalizedAnswers, // Используем нормализованные ответы
        timeSpent: Math.floor(timeSpent)
      };

      const response = await lastValueFrom(this.apiService.submitTest(submission));

      if (response.success && response.data) {
        console.log('Результат теста:', response.data);
        this.router.navigate(['/my-test-results']);
      } else {
        this.errorMessage = response.message || 'Ошибка при отправке теста';
      }
    } catch (error: any) {
      console.error('Ошибка отправки теста:', error);
      this.errorMessage = error.message || 'Ошибка при отправке теста';
      this.isSubmitting = false;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
