import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { ApiService, TestResponse, Question, TestCreateRequest } from '../../../services/api.service';
import { lastValueFrom } from 'rxjs';
import { TestQuestionsComponent } from '../../../components/test-questions/test-questions.component';

@Component({
  selector: 'app-test-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TestQuestionsComponent], // Добавьте здесь
  templateUrl: './test-management.component.html',
  styleUrls: ['./test-management.component.css']
})

export class TestManagementComponent implements OnInit {
  showAddTestForm = false;
  testForm: FormGroup;
  tests: TestResponse[] = [];
  isLoading = false;
  errorMessage = '';
  isEditing = false;
  editingTestId: string | null = null;

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
      timeLimit: [30, [Validators.required, Validators.min(5), Validators.max(180)]],
      questions: this.fb.array([]),
      passingScore: [60, [Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  get questionsFormArray(): FormArray {
    return this.testForm.get('questions') as FormArray;
  }

  onQuestionsChange(questions: Question[]) {
    // Обработка изменений вопросов, если нужно
    console.log('Questions changed:', questions);
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

  // В test-management.component.ts добавьте:
  getQuestionControl(index: number, controlName: string) {
    return this.questionsFormArray.at(index).get(controlName);
  }

  getQuestionTextControl(index: number) {
    return this.questionsFormArray.at(index).get('text')!;
  }

  getQuestionTypeControl(index: number) {
    return this.questionsFormArray.at(index).get('type')!;
  }

  getQuestionCorrectAnswerControl(index: number) {
    return this.questionsFormArray.at(index).get('correctAnswer')!;
  }

  getQuestionPointsControl(index: number) {
    return this.questionsFormArray.at(index).get('points')!;
  }

  createQuestionForm(question?: Partial<Question>): FormGroup {
    return this.fb.group({
      id: [question?.id || ''],
      text: [question?.text || '', Validators.required],
      type: [question?.type || 'single', Validators.required],
      options: this.fb.array((question?.options || []).map(opt => this.fb.control(opt))),
      correctAnswer: [question?.correctAnswer || '', Validators.required],
      points: [question?.points || 1, [Validators.min(1), Validators.max(10)]],
      order: [question?.order || 0]
    });
  }

  addQuestion() {
    const newQuestion = this.createQuestionForm();
    this.questionsFormArray.push(newQuestion);
  }

  removeQuestion(index: number) {
    if (this.questionsFormArray.length > 1) {
      this.questionsFormArray.removeAt(index);
    }
  }

  editTest(test: TestResponse) {
    this.isEditing = true;
    this.editingTestId = test.id;
    this.showAddTestForm = true;

    // Очищаем существующие вопросы
    while (this.questionsFormArray.length !== 0) {
      this.questionsFormArray.removeAt(0);
    }

    // Заполняем форму данными теста
    this.testForm.patchValue({
      title: test.title,
      topic: test.topic,
      description: test.description,
      difficulty: test.difficulty,
      timeLimit: test.timeLimit,
      passingScore: 60,
      isActive: test.isActive
    });

    // Добавляем вопросы
    test.questions?.forEach((question: Question) => {
      const questionGroup = this.createQuestionForm(question);
      this.questionsFormArray.push(questionGroup);
    });
  }

  async createOrUpdateTest() {
    if (this.testForm.valid && this.questionsFormArray.length > 0) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const testData: TestCreateRequest = {
          ...this.testForm.value,
          questions: this.questionsFormArray.value.map((q: any) => ({
            text: q.text,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            order: q.order || 0
          }))
        };

        if (this.isEditing && this.editingTestId) {
          // Обновление существующего теста
          const response = await lastValueFrom(
            this.apiService.updateTest(this.editingTestId, testData)
          );
          if (response.success && response.data) {
            await this.loadTests();
            this.resetForm();
          } else {
            this.errorMessage = response.message || 'Не удалось обновить тест';
          }
        } else {
          // Создание нового теста
          const response = await lastValueFrom(
            this.apiService.createTest(testData)
          );
          if (response.success && response.data) {
            await this.loadTests();
            this.resetForm();
          } else {
            this.errorMessage = response.message || 'Не удалось создать тест';
          }
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Ошибка при сохранении теста';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Пожалуйста, заполните все обязательные поля и добавьте хотя бы один вопрос';
      this.markFormGroupTouched(this.testForm);
    }
  }

  async deleteTest(id: string) {
    if (confirm('Вы уверены, что хотите удалить этот тест? Все результаты также будут удалены.')) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const response = await lastValueFrom(this.apiService.deleteTest(id));
        if (response.success) {
          await this.loadTests();
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

  resetForm() {
    this.testForm.reset({
      difficulty: 'beginner',
      timeLimit: 30,
      passingScore: 60,
      isActive: true
    });
    while (this.questionsFormArray.length !== 0) {
      this.questionsFormArray.removeAt(0);
    }
    this.showAddTestForm = false;
    this.isEditing = false;
    this.editingTestId = null;
    this.errorMessage = '';
  }

  cancelEdit() {
    this.resetForm();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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
  get passingScore() { return this.testForm.get('passingScore'); }
}
