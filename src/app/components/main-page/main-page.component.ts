import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  features = [
    {
      icon: '🧮',
      title: 'Калькуляторы',
      description: 'Современные калькуляторы для решения математических задач: обычный, матричный и калькулятор множеств'
    },
    {
      icon: '📚',
      title: 'Теория',
      description: 'Полные учебные материалы по всем темам, доступные в любое время'
    },
    {
      icon: '🧪',
      title: 'Тесты',
      description: 'Интерактивные тесты для проверки знаний с автоматической проверкой'
    },
    {
      icon: '📊',
      title: 'Прогресс',
      description: 'Отслеживайте свой прогресс и достижения в обучении'
    }
  ];

  testimonials = [
    {
      text: 'Отличная платформа! Особенно полезны калькуляторы матриц и множеств для студентов технических специальностей.',
      author: 'Иван Петров, студент МГТУ'
    },
    {
      text: 'Удобный интерфейс и качественные материалы. Использую на занятиях со студентами.',
      author: 'Мария Сидорова, преподаватель'
    }
  ];

  constructor(private router: Router) {}

  navigateToRegister(): void {
    this.router.navigate(['/auth/registration']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
