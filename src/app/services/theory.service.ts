import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { TheorySection } from '../models/theory.model';

@Injectable({
  providedIn: 'root'
})
export class TheoryService {
  // Моковые данные для начала разработки
  private mockSections: TheorySection[] = [
    {
      id: '1',
      topic: 'calculator',
      title: 'Основы арифметики',
      content: `
        <h3>Что такое арифметика?</h3>
        <p>Арифметика - это раздел математики, изучающий числа и простейшие операции над ними.</p>

        <h3>Основные операции</h3>
        <ul>
          <li><strong>Сложение (+)</strong> - объединение двух чисел в одно</li>
          <li><strong>Вычитание (-)</strong> - нахождение разности чисел</li>
          <li><strong>Умножение (×)</strong> - повторное сложение одного числа</li>
          <li><strong>Деление (/)</strong> - разбиение числа на равные части</li>
        </ul>

        <h3>Порядок операций</h3>
        <p>При вычислении выражений соблюдайте порядок: скобки → умножение/деление → сложение/вычитание.</p>
      `,
      order: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
      isActive: true
    },
    {
      id: '2',
      topic: 'sets',
      title: 'Введение в теорию множеств',
      content: `
        <h3>Что такое множество?</h3>
        <p>Множество - это совокупность объектов (элементов), которые рассматриваются как единое целое.</p>

        <h3>Обозначения</h3>
        <ul>
          <li>Множества обозначаются заглавными буквами: A, B, C...</li>
          <li>Элементы множества перечисляются в фигурных скобках: {1, 2, 3}</li>
          <li>Пустое множество: ∅ или {}</li>
        </ul>

        <h3>Основные операции</h3>
        <div class="operation-grid">
          <div class="operation">
            <strong>Объединение (A ∪ B)</strong><br>
            Все элементы из A и B
          </div>
          <div class="operation">
            <strong>Пересечение (A ∩ B)</strong><br>
            Элементы, принадлежащие и A, и B
          </div>
          <div class="operation">
            <strong>Разность (A \ B)</strong><br>
            Элементы A, не принадлежащие B
          </div>
          <div class="operation">
            <strong>Симм. разность (A ∆ B)</strong><br>
            Элементы, принадлежащие только одному множеству
          </div>
        </div>

        <h3>Пример</h3>
        <p>A = {1, 2, 3}, B = {3, 4, 5}</p>
        <p>A ∪ B = {1, 2, 3, 4, 5}</p>
      `,
      order: 1,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-15'),
      isActive: true
    },
    {
      id: '3',
      topic: 'sets',
      title: 'Диаграммы Эйлера-Венна',
      content: `
        <h3>Визуализация множеств</h3>
        <p>Диаграммы Эйлера-Венна используются для наглядного представления множеств и операций над ними.</p>

        <h3>Основные принципы</h3>
        <ul>
          <li>Каждое множество изображается кругом или овалом</li>
          <li>Пересечение множеств - общая область кругов</li>
          <li>Элементы внутри области принадлежат множеству</li>
        </ul>

        <h3>Примеры операций</h3>
        <div class="diagram-examples">
          <div class="example">
            <strong>A ∩ B</strong><br>
            Закрашивается область пересечения
          </div>
          <div class="example">
            <strong>A ∪ B</strong><br>
            Закрашиваются оба круга
          </div>
          <div class="example">
            <strong>A \ B</strong><br>
            Закрашивается часть A без пересечения
          </div>
        </div>
      `,
      order: 2,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-12'),
      isActive: true
    },
    {
      id: '4',
      topic: 'matrices',
      title: 'Основы матричной алгебры',
      content: `
        <h3>Что такое матрица?</h3>
        <p>Матрица - это прямоугольная таблица чисел, расположенных в строках и столбцах.</p>

        <h3>Обозначение матрицы</h3>
        <p>Матрица размера m×n имеет m строк и n столбцов:</p>
        <pre>
        A = [ a₁₁  a₁₂  a₁₃ ]
            [ a₂₁  a₂₂  a₂₃ ]
        </pre>

        <h3>Основные операции</h3>
        <ul>
          <li><strong>Сложение/вычитание</strong> - поэлементно для матриц одинакового размера</li>
          <li><strong>Умножение</strong> - число столбцов первой = числу строк второй</li>
          <li><strong>Транспонирование</strong> - строки становятся столбцами</li>
          <li><strong>Определитель</strong> - только для квадратных матриц</li>
        </ul>
      `,
      order: 1,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-18'),
      isActive: true
    }
  ];

  constructor() {}

  // Получить теорию по теме
  getTheoryByTopic(topic: 'calculator' | 'sets' | 'matrices'): Observable<TheorySection[]> {
    // Имитация загрузки с сервера
    const sections = this.mockSections
      .filter(section => section.topic === topic && section.isActive)
      .sort((a, b) => a.order - b.order);

    return of(sections).pipe(delay(300)); // Имитация задержки сети
  }

  // Для админки: получение всех разделов
  getAllTheorySections(): Observable<TheorySection[]> {
    return of([...this.mockSections]);
  }

  // Для админки: сохранение раздела
  saveSection(section: TheorySection): Observable<TheorySection> {
    // Если есть id - обновляем, иначе создаем новый
    if (section.id) {
      const index = this.mockSections.findIndex(s => s.id === section.id);
      if (index !== -1) {
        this.mockSections[index] = {
          ...section,
          updatedAt: new Date()
        };
      }
    } else {
      const newSection: TheorySection = {
        ...section,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockSections.push(newSection);
    }

    return of(section);
  }

  // Генерация ID (временное решение)
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
