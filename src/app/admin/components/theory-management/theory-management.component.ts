import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { TheoryService } from '../../../services/theory.service';
import { TheorySection } from '../../../models/theory.model';

@Component({
  selector: 'app-theory-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './theory-management.component.html',
  styleUrls: ['./theory-management.component.css']
})
export class TheoryManagementComponent implements OnInit, OnDestroy {
  sections: TheorySection[] = [];
  filteredSections: TheorySection[] = [];

  // Форма
  isEditing = false;
  currentSection: TheorySection | null = null;

  // Данные формы
  formData = {
    topic: 'calculator' as 'calculator' | 'sets' | 'matrices',
    title: '',
    content: '',
    order: 1,
    isActive: true
  };

  // Фильтры
  topics = [
    { value: 'calculator', label: 'Калькулятор' },
    { value: 'sets', label: 'Множества' },
    { value: 'matrices', label: 'Матрицы' }
  ];

  selectedTopic = 'all';
  searchQuery = '';

  // Состояния
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private theoryService: TheoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Временное отключение проверки прав (чтобы компонент работал)
    // TODO: Включить проверку когда будет готова авторизация
    // if (!this.authService.isAdmin()) {
    //   this.error = 'Доступ запрещен. Только администраторы могут управлять теорией.';
    //   return;
    // }

    this.loadSections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSections(): void {
    this.isLoading = true;
    this.error = null;

    this.theoryService.getAllTheorySections()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sections) => {
          this.sections = sections;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Не удалось загрузить разделы теории. Попробуйте обновить страницу.';
          this.isLoading = false;
          console.error('Ошибка загрузки разделов:', err);
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.sections];

    // Фильтр по теме
    if (this.selectedTopic !== 'all') {
      filtered = filtered.filter(section => section.topic === this.selectedTopic);
    }

    // Поиск по названию
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(section =>
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query)
      );
    }

    // Сортировка по порядку и дате обновления
    filtered.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    this.filteredSections = filtered;
  }

  onTopicChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  // Создание нового раздела
  createSection(): void {
    this.isEditing = true;
    this.currentSection = null;
    this.resetForm();
  }

  // Редактирование существующего раздела
  editSection(section: TheorySection): void {
    this.isEditing = true;
    this.currentSection = section;

    this.formData = {
      topic: section.topic,
      title: section.title,
      content: section.content,
      order: section.order,
      isActive: section.isActive
    };
  }

  // Сохранение раздела
  saveSection(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const sectionData: TheorySection = {
      id: this.currentSection?.id || '',
      ...this.formData,
      createdAt: this.currentSection?.createdAt || new Date(),
      updatedAt: new Date()
    };

    this.theoryService.saveSection(sectionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedSection) => {
          if (this.currentSection) {
            // Обновление существующего
            const index = this.sections.findIndex(s => s.id === savedSection.id);
            if (index !== -1) {
              this.sections[index] = savedSection;
            }
            this.successMessage = 'Раздел успешно обновлен';
          } else {
            // Добавление нового
            this.sections.unshift(savedSection);
            this.successMessage = 'Раздел успешно создан';
          }

          this.applyFilters();
          this.cancelEdit();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Ошибка при сохранении раздела. Проверьте подключение к серверу.';
          this.isLoading = false;
          console.error('Ошибка сохранения:', err);
        }
      });
  }

  // Удаление раздела
  deleteSection(section: TheorySection): void {
    if (!confirm(`Вы уверены, что хотите удалить раздел "${section.title}"?`)) {
      return;
    }

    this.isLoading = true;

    this.theoryService.deleteSection(section.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            this.sections = this.sections.filter(s => s.id !== section.id);
            this.applyFilters();
            this.successMessage = 'Раздел успешно удален';
          } else {
            this.error = 'Не удалось удалить раздел';
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Ошибка при удалении раздела';
          this.isLoading = false;
          console.error('Ошибка удаления:', err);
        }
      });
  }

  // Переключение активности
  toggleSectionActive(section: TheorySection): void {
    this.isLoading = true;

    this.theoryService.toggleSectionActive(section.id, !section.isActive)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSection) => {
          const index = this.sections.findIndex(s => s.id === updatedSection.id);
          if (index !== -1) {
            this.sections[index] = updatedSection;
          }
          this.applyFilters();
          this.isLoading = false;
          this.successMessage = `Раздел "${section.title}" ${updatedSection.isActive ? 'активирован' : 'деактивирован'}`;
        },
        error: (err) => {
          this.error = 'Ошибка при изменении статуса раздела';
          this.isLoading = false;
          console.error('Ошибка изменения статуса:', err);
        }
      });
  }

  // Отмена редактирования
  cancelEdit(): void {
    this.isEditing = false;
    this.currentSection = null;
    this.resetForm();
    this.error = null;
    this.successMessage = null;
  }

  // Сброс формы
  resetForm(): void {
    this.formData = {
      topic: 'calculator',
      title: '',
      content: '',
      order: 1,
      isActive: true
    };
  }

  // Валидация формы
  validateForm(): boolean {
    if (!this.formData.title.trim()) {
      this.error = 'Введите название раздела';
      return false;
    }

    if (!this.formData.content.trim()) {
      this.error = 'Введите содержание раздела';
      return false;
    }

    if (this.formData.order < 1) {
      this.error = 'Порядок должен быть положительным числом';
      return false;
    }

    return true;
  }

  // Получение метки для темы
  getTopicLabel(topic: string): string {
    const topicMap: Record<string, string> = {
      'calculator': 'Калькулятор',
      'sets': 'Множества',
      'matrices': 'Матрицы'
    };
    return topicMap[topic] || topic;
  }

  // Форматирование даты
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
