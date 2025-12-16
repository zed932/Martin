import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TheorySection } from '../models/theory.model';
import {
  ApiService,
  TheorySectionResponse,
  TheoryCreateRequest,
  TheoryUpdateRequest
} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TheoryService {
  constructor(private apiService: ApiService) {}

  // Получить теорию по теме (теперь через API)
  getTheoryByTopic(topic: 'calculator' | 'sets' | 'matrices'): Observable<TheorySection[]> {
    return this.apiService.getTheoryByTopic(topic).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapTheorySections(response.data);
        }
        // Если API недоступен, возвращаем пустой массив
        return [];
      })
    );
  }

  // Получить все разделы (для админки)
  getAllTheorySections(): Observable<TheorySection[]> {
    return this.apiService.getAllTheory().pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapTheorySections(response.data);
        }
        return [];
      })
    );
  }

  // Получить конкретный раздел
  getTheorySectionById(id: string): Observable<TheorySection | null> {
    return this.getAllTheorySections().pipe(
      map(sections => {
        const section = sections.find(s => s.id === id);
        return section || null;
      })
    );
  }

  // Сохранить раздел (создать или обновить)
  saveSection(section: TheorySection): Observable<TheorySection> {
    const sectionData: TheoryCreateRequest = {
      topic: section.topic,
      title: section.title,
      content: section.content,
      order: section.order,
      isActive: section.isActive
    };

    if (section.id) {
      // Обновление существующего раздела
      const updateData: TheoryUpdateRequest = {
        ...sectionData
      };

      return this.apiService.updateTheorySection(section.id, updateData).pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapTheorySection(response.data);
          }
          throw new Error(response.message || 'Ошибка при обновлении раздела');
        })
      );
    } else {
      // Создание нового раздела
      return this.apiService.createTheorySection(sectionData).pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapTheorySection(response.data);
          }
          throw new Error(response.message || 'Ошибка при создании раздела');
        })
      );
    }
  }

  // Удалить раздел
  deleteSection(id: string): Observable<boolean> {
    return this.apiService.deleteTheorySection(id).pipe(
      map(response => response.success)
    );
  }

  // Активировать/деактивировать раздел
  toggleSectionActive(id: string, isActive: boolean): Observable<TheorySection> {
    return this.apiService.updateTheorySection(id, { isActive }).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapTheorySection(response.data);
        }
        throw new Error(response.message || 'Ошибка при изменении статуса раздела');
      })
    );
  }

  // Вспомогательный метод для преобразования ответа API
  private mapTheorySections(sections: TheorySectionResponse[]): TheorySection[] {
    return sections.map(section => this.mapTheorySection(section));
  }

  // Вспомогательный метод для преобразования одного раздела
  private mapTheorySection(section: TheorySectionResponse): TheorySection {
    return {
      id: section.id,
      topic: section.topic,
      title: section.title,
      content: section.content,
      order: section.order,
      createdAt: new Date(section.createdAt),
      updatedAt: new Date(section.updatedAt),
      isActive: section.isActive
    };
  }

  // Временный fallback на моковые данные, если API не доступно
  private getMockSections(): TheorySection[] {
    return [
      {
        id: '1',
        topic: 'calculator',
        title: 'Основы арифметики',
        content: '<h3>Что такое арифметика?</h3><p>Арифметика - это раздел математики, изучающий числа и простейшие операции над ними.</p>',
        order: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
        isActive: true
      },
      {
        id: '2',
        topic: 'sets',
        title: 'Введение в теорию множеств',
        content: '<h3>Что такое множество?</h3><p>Множество - это совокупность объектов (элементов), которые рассматриваются как единое целое.</p>',
        order: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-15'),
        isActive: true
      }
    ];
  }
}
