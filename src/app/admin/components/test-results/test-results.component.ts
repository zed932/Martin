import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.css']
})
export class TestResultsComponent {
  testResults = [
    {
      id: 1,
      userName: 'Иван Иванов',
      userEmail: 'ivan@edu.ru',
      testName: 'Основы теории множеств',
      date: '2024-03-10',
      correct: 14,
      total: 15,
      grade: 'Отлично',
      timeSpent: '25 мин'
    },
    {
      id: 2,
      userName: 'Мария Петрова',
      userEmail: 'maria@edu.ru',
      testName: 'Матричные операции',
      date: '2024-03-09',
      correct: 18,
      total: 20,
      grade: 'Отлично',
      timeSpent: '40 мин'
    },
    {
      id: 3,
      userName: 'Алексей Смирнов',
      userEmail: 'alex@edu.ru',
      testName: 'Алгебраические выражения',
      date: '2024-03-08',
      correct: 15,
      total: 25,
      grade: 'Хорошо',
      timeSpent: '55 мин'
    },
    {
      id: 4,
      userName: 'Елена Кузнецова',
      userEmail: 'elena@edu.ru',
      testName: 'Основы теории множеств',
      date: '2024-03-07',
      correct: 10,
      total: 15,
      grade: 'Удовлетворительно',
      timeSpent: '28 мин'
    }
  ];

  get totalTests(): number {
    return this.testResults.length;
  }

  get averageScore(): string {
    const total = this.testResults.reduce((sum, result) => sum + (result.correct / result.total), 0);
    const average = (total / this.testResults.length) * 100;
    return average.toFixed(1);
  }

  get bestScore(): string {
    const best = Math.max(...this.testResults.map(result => (result.correct / result.total) * 100));
    return best.toFixed(1);
  }
}
