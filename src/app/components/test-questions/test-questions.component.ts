import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Question } from '../../services/api.service';

@Component({
  selector: 'app-test-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="questions-editor">
      <div class="questions-header">
        <h5>Вопросы теста ({{ questionsFormArray.length }})</h5>
        <button type="button" class="btn-add-question" (click)="addQuestion()">
          + Добавить вопрос
        </button>
      </div>

      <div class="questions-list">
        @for (question of questionsFormArray.controls; track question.get('id')?.value || $index; let i = $index) {
          <div class="question-card" [formGroup]="getQuestionFormGroup(i)">
            <div class="question-header">
              <span class="question-number">Вопрос {{ i + 1 }}</span>
              <button
                type="button"
                class="btn-remove-question"
                (click)="removeQuestion(i)"
                [disabled]="questionsFormArray.length <= 1">
                ✕
              </button>
            </div>

            <div class="question-body">
              <div class="form-group">
                <label>Текст вопроса *</label>
                <textarea
                  formControlName="text"
                  class="form-control"
                  rows="2"
                  placeholder="Введите текст вопроса"></textarea>
                @if (getQuestionFormGroup(i).get('text')?.invalid && getQuestionFormGroup(i).get('text')?.touched) {
                  <div class="invalid-feedback">Текст вопроса обязателен</div>
                }
              </div>

              <div class="form-group">
                <label>Тип вопроса</label>
                <select formControlName="type" class="form-control">
                  <option value="single">Один правильный ответ</option>
                  <option value="multiple">Несколько правильных ответов</option>
                  <option value="text">Текстовый ответ</option>
                </select>
              </div>

              @if (getQuestionFormGroup(i).get('type')?.value === 'single' || getQuestionFormGroup(i).get('type')?.value === 'multiple') {
                <div class="form-group">
                  <label>Варианты ответов *</label>
                  <div formArrayName="options">
                    <div class="options-list">
                      @for (option of getOptions(i).controls; track $index; let j = $index) {
                        <div class="option-row">
                          <input
                            type="text"
                            [formControlName]="j"
                            class="form-control form-control-sm"
                            placeholder="Вариант {{ j + 1 }}">
                          <button
                            type="button"
                            class="btn-remove-option"
                            (click)="removeOption(i, j)"
                            [disabled]="getOptions(i).length <= 2">
                            ✕
                          </button>
                        </div>
                      }
                    </div>
                    <button
                      type="button"
                      class="btn-add-option"
                      (click)="addOption(i)">
                      + Добавить вариант
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Правильный ответ *</label>
                  @if (getQuestionFormGroup(i).get('type')?.value === 'single') {
                    <select formControlName="correctAnswer" class="form-control">
                      <option value="">Выберите правильный ответ</option>
                      @for (option of getOptions(i).value; track $index; let j = $index) {
                        <option [value]="j">Вариант {{ j + 1 }}</option>
                      }
                    </select>
                  } @else if (getQuestionFormGroup(i).get('type')?.value === 'multiple') {
                    <div class="multiple-answers">
                      @for (option of getOptions(i).value; track $index; let j = $index) {
                        <label class="checkbox-label">
                          <input
                            type="checkbox"
                            [value]="j"
                            (change)="onMultipleAnswerChange($event, i)">
                          Вариант {{ j + 1 }}
                        </label>
                      }
                    </div>
                  }
                </div>
              }

              <div class="form-group">
                <label>Баллы за вопрос</label>
                <input
                  type="number"
                  formControlName="points"
                  class="form-control"
                  min="1"
                  max="10"
                  value="1">
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .questions-editor {
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin: var(--space-4) 0;
      background: var(--color-white);
    }

    .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-gray-200);
    }

    .questions-header h5 {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: 400;
      color: var(--color-black);
    }

    .btn-add-question {
      background: var(--color-black);
      color: var(--color-white);
      border: 2px solid var(--color-black);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: 400;
      transition: all var(--transition-normal);
      white-space: nowrap;
      min-height: 2.5rem;
    }

    .btn-add-question:hover:not(:disabled) {
      background: var(--color-gray-800);
      border-color: var(--color-gray-800);
      transform: translateY(-1px);
    }

    .questions-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .question-card {
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      background: var(--color-white);
      transition: border-color var(--transition-normal);
    }

    .question-card:hover {
      border-color: var(--color-gray-300);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }

    .question-number {
      font-weight: 500;
      color: var(--color-black);
      font-size: var(--font-size-sm);
    }

    .btn-remove-question {
      background: transparent;
      color: var(--color-tart-orange);
      border: 1px solid var(--color-tart-orange);
      border-radius: var(--radius-sm);
      width: 1.5rem;
      height: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: all var(--transition-fast);
      padding: 0;
    }

    .btn-remove-question:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-tart-orange) 10%, transparent);
    }

    .btn-remove-question:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .question-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      margin-bottom: var(--space-1);
      color: var(--color-gray-800);
      font-size: var(--font-size-sm);
      font-weight: 400;
    }

    .form-control {
      width: 100%;
      padding: var(--space-2);
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-family: inherit;
      box-sizing: border-box;
      background: var(--color-white);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-black);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 4rem;
      line-height: 1.4;
    }

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      background-size: 1rem;
      padding-right: 2rem;
    }

    .invalid-feedback {
      color: var(--color-tart-orange);
      font-size: var(--font-size-xs);
      margin-top: var(--space-1);
      display: block;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .option-row {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }

    .form-control-sm {
      flex: 1;
      min-width: 0;
    }

    .btn-remove-option {
      background: transparent;
      color: var(--color-gray-600);
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-sm);
      width: 1.8rem;
      height: 1.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .btn-remove-option:hover:not(:disabled) {
      background: var(--color-gray-100);
      border-color: var(--color-gray-400);
    }

    .btn-remove-option:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-add-option {
      background: transparent;
      color: var(--color-gray-700);
      border: 1px dashed var(--color-gray-400);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-xs);
      transition: all var(--transition-fast);
      align-self: flex-start;
    }

    .btn-add-option:hover {
      background: var(--color-gray-50);
      border-style: solid;
      border-color: var(--color-gray-500);
    }

    .multiple-answers {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-2);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      background: var(--color-gray-50);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      cursor: pointer;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .questions-editor {
        padding: var(--space-3);
      }

      .questions-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-2);
      }

      .questions-header h5 {
        font-size: var(--font-size-base);
      }

      .btn-add-question {
        width: 100%;
      }

      .question-card {
        padding: var(--space-3);
      }

      .option-row {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-remove-option {
        align-self: flex-start;
        width: 2rem;
      }

      .form-control-sm {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .questions-editor {
        padding: var(--space-2);
      }

      .question-card {
        padding: var(--space-2);
      }

      .question-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-1);
      }

      .btn-remove-question {
        align-self: flex-start;
      }

      .multiple-answers {
        padding: var(--space-1);
      }
    }

    @media (max-width: 340px) {
      .form-group label {
        font-size: 0.8rem;
      }

      .form-control {
        font-size: 0.8rem;
        padding: 0.4rem;
      }

      .checkbox-label {
        font-size: 0.8rem;
      }
    }
  `]
})
export class TestQuestionsComponent implements OnInit {
  @Input() questionsFormArray!: FormArray;
  @Output() questionsChange = new EventEmitter<Question[]>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    if (this.questionsFormArray.length === 0) {
      this.addQuestion();
    }
  }

  getQuestionFormGroup(index: number): FormGroup {
    return this.questionsFormArray.at(index) as FormGroup;
  }

  getOptions(questionIndex: number): FormArray {
    return this.getQuestionFormGroup(questionIndex).get('options') as FormArray;
  }

  createQuestionForm(question?: Partial<Question>): FormGroup {
    return this.fb.group({
      id: [question?.id || ''],
      text: [question?.text || '', Validators.required],
      type: [question?.type || 'single', Validators.required],
      options: this.fb.array((question?.options || []).map((opt: string) => this.fb.control(opt)) || [
        this.fb.control(''),
        this.fb.control('')
      ]),
      correctAnswer: [question?.correctAnswer || '', Validators.required],
      points: [question?.points || 1, [Validators.min(1), Validators.max(10)]]
    });
  }

  addQuestion() {
    const newQuestion = this.createQuestionForm();
    this.questionsFormArray.push(newQuestion);
    this.emitQuestions();
  }

  removeQuestion(index: number) {
    if (this.questionsFormArray.length > 1) {
      this.questionsFormArray.removeAt(index);
      this.emitQuestions();
    }
  }

  addOption(questionIndex: number) {
    const options = this.getOptions(questionIndex);
    options.push(this.fb.control(''));
    this.emitQuestions();
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptions(questionIndex);
    if (options.length > 2) {
      options.removeAt(optionIndex);
      this.emitQuestions();
    }
  }

  onMultipleAnswerChange(event: Event, questionIndex: number) {
    const checkbox = event.target as HTMLInputElement;
    const question = this.getQuestionFormGroup(questionIndex);
    const currentAnswers = question.get('correctAnswer')?.value?.split(',') || [];
    const value = checkbox.value;

    if (checkbox.checked) {
      currentAnswers.push(value);
    } else {
      const index = currentAnswers.indexOf(value);
      if (index > -1) {
        currentAnswers.splice(index, 1);
      }
    }

    question.get('correctAnswer')?.setValue(currentAnswers.join(','));
    this.emitQuestions();
  }

  private emitQuestions() {
    const questions = this.questionsFormArray.value.map((q: any) => ({
      ...q,
      options: q.options || []
    }));
    this.questionsChange.emit(questions);
  }
}
