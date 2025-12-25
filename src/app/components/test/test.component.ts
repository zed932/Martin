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
      max-width: var(--container-lg);
      margin: 0 auto;
      padding: var(--space-4);
      background: var(--color-white);
    }

    /* Loading & Error States */
    .loading, .error {
      text-align: center;
      padding: var(--space-8);
      font-size: var(--font-size-lg);
      color: var(--color-gray-700);
      background: var(--color-white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
    }

    .error {
      color: var(--color-tart-orange);
    }

    .btn-back {
      background: var(--color-black);
      color: var(--color-white);
      border: 2px solid var(--color-black);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: 400;
      transition: all var(--transition-normal);
      display: block;
      margin: var(--space-3) auto;
      min-height: 2.5rem;
    }

    .btn-back:hover {
      background: var(--color-gray-800);
      border-color: var(--color-gray-800);
      transform: translateY(-1px);
    }

    /* Test Header */
    .test-header {
      background: var(--color-gray-50);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
      border: 1px solid var(--color-gray-200);
    }

    .test-header h3 {
      margin: 0 0 var(--space-3) 0;
      font-size: var(--font-size-2xl);
      font-weight: 400;
      color: var(--color-black);
      line-height: 1.3;
      word-break: break-word;
    }

    .test-info {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin: var(--space-3) 0;
      color: var(--color-gray-600);
      font-size: var(--font-size-sm);
      align-items: center;
    }

    .test-info span {
      background: var(--color-white);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-gray-200);
    }

    .timer {
      background: var(--color-black);
      color: var(--color-white);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 400;
      display: inline-block;
      margin-top: var(--space-2);
    }

    /* Test Description */
    .test-description {
      background: var(--color-gray-50);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-5);
      border: 1px solid var(--color-gray-200);
    }

    .test-description p {
      margin: 0;
      color: var(--color-gray-700);
      font-size: var(--font-size-sm);
      line-height: 1.5;
      word-break: break-word;
    }

    /* Questions Section */
    .questions-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .question-item {
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      background: var(--color-white);
      transition: border-color var(--transition-normal);
    }

    .question-item:hover {
      border-color: var(--color-gray-300);
    }

    .question-text {
      margin-bottom: var(--space-3);
    }

    .question-text h5 {
      margin: 0 0 var(--space-1) 0;
      font-size: var(--font-size-base);
      font-weight: 500;
      color: var(--color-black);
    }

    .question-text p {
      margin: 0;
      color: var(--color-gray-700);
      font-size: var(--font-size-sm);
      line-height: 1.5;
      word-break: break-word;
    }

    /* Question Options */
    .question-options {
      margin-top: var(--space-3);
    }

    .single-options,
    .multiple-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .option-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      transition: all var(--transition-fast);
      background: var(--color-white);
    }

    .option-label:hover {
      background: var(--color-gray-50);
      border-color: var(--color-gray-400);
    }

    .option-label input[type="radio"],
    .option-label input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      margin: 0;
      cursor: pointer;
    }

    textarea.form-control {
      width: 100%;
      padding: var(--space-2);
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-family: inherit;
      resize: vertical;
      min-height: 5rem;
      line-height: 1.4;
      box-sizing: border-box;
    }

    textarea.form-control:focus {
      outline: none;
      border-color: var(--color-black);
    }

    /* Test Actions */
    .test-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      justify-content: center;
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-gray-200);
    }

    .btn-submit,
    .btn-cancel {
      padding: var(--space-2) var(--space-6);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: 400;
      transition: all var(--transition-normal);
      border: 2px solid;
      min-height: 2.5rem;
      font-family: inherit;
    }

    .btn-submit {
      background: var(--color-green-lizard);
      color: var(--color-black);
      border-color: var(--color-green-lizard);
    }

    .btn-submit:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-green-lizard) 80%, var(--color-black));
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      background: var(--color-gray-300);
      color: var(--color-gray-600);
      border-color: var(--color-gray-300);
      cursor: not-allowed;
      transform: none;
    }

    .btn-cancel {
      background: var(--color-white);
      color: var(--color-gray-700);
      border-color: var(--color-gray-300);
    }

    .btn-cancel:hover {
      background: var(--color-gray-50);
      border-color: var(--color-gray-400);
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 0.15rem solid var(--color-black);
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
      margin-right: var(--space-2);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .test-container {
        padding: var(--space-3);
      }

      .test-header {
        padding: var(--space-4);
      }

      .test-header h3 {
        font-size: var(--font-size-xl);
      }

      .test-info {
        gap: var(--space-2);
      }

      .test-info span {
        font-size: var(--font-size-xs);
      }

      .question-item {
        padding: var(--space-3);
      }

      .test-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-submit,
      .btn-cancel {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .test-container {
        padding: var(--space-2);
      }

      .test-header,
      .test-description {
        padding: var(--space-3);
      }

      .test-header h3 {
        font-size: var(--font-size-lg);
      }

      .test-info {
        flex-direction: column;
        align-items: stretch;
      }

      .test-info span {
        text-align: center;
      }

      .option-label {
        padding: var(--space-1) var(--space-2);
        font-size: var(--font-size-xs);
      }

      textarea.form-control {
        min-height: 4rem;
      }
    }

    @media (max-width: 340px) {
      .test-header h3 {
        font-size: var(--font-size-base);
      }

      .timer {
        font-size: var(--font-size-xs);
        padding: var(--space-1) var(--space-2);
      }

      .question-text p {
        font-size: var(--font-size-xs);
      }

      .option-label {
        font-size: 0.8rem;
      }

      .btn-submit,
      .btn-cancel {
        font-size: 0.9rem;
        padding: var(--space-1) var(--space-3);
      }
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
