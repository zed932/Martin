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
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .btn-add-question {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .question-card {
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      background: #f8f9fa;
    }
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .question-number {
      font-weight: bold;
      color: #495057;
    }
    .btn-remove-question {
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .option-row {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
    }
    .btn-remove-option {
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      padding: 0 12px;
    }
    .btn-add-option {
      background: #28a745;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
    .multiple-answers {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
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
