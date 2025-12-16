import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-management.component.html',
  styleUrls: ['./test-management.component.css']
})
export class TestManagementComponent {
  showAddTestForm = false;
  testForm: FormGroup;

  tests = [
    {
      id: 1,
      title: 'Основы теории множеств',
      description: 'Проверка знаний основных операций с множествами',
      topic: 'sets',
      questionsCount: 15,
      timeLimit: 30,
      difficulty: 'Начальный'
    },
    {
      id: 2,
      title: 'Матричные операции',
      description: 'Сложение, умножение и транспонирование матриц',
      topic: 'matrices',
      questionsCount: 20,
      timeLimit: 45,
      difficulty: 'Средний'
    },
    {
      id: 3,
      title: 'Алгебраические выражения',
      description: 'Упрощение и решение уравнений',
      topic: 'algebra',
      questionsCount: 25,
      timeLimit: 60,
      difficulty: 'Продвинутый'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({
      title: ['', Validators.required],
      topic: ['', Validators.required],
      description: ['', Validators.required],
      questionsCount: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      timeLimit: [30, [Validators.required, Validators.min(5), Validators.max(180)]]
    });
  }

  createTest() {
    if (this.testForm.valid) {
      const newTest = {
        id: this.tests.length + 1,
        ...this.testForm.value,
        difficulty: 'Начальный'
      };
      this.tests.push(newTest);
      this.testForm.reset();
      this.showAddTestForm = false;
    }
  }

  deleteTest(id: number) {
    this.tests = this.tests.filter(test => test.id !== id);
  }

  getTopicName(topic: string): string {
    const topics: {[key: string]: string} = {
      'calculus': 'Математический анализ',
      'algebra': 'Алгебра',
      'geometry': 'Геометрия',
      'sets': 'Теория множеств',
      'matrices': 'Матрицы'
    };
    return topics[topic] || topic;
  }
}
