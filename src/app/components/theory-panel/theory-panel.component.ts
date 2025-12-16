import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TheoryService } from '../../services/theory.service';
import { TheorySection } from '../../models/theory.model';

@Component({
  selector: 'app-theory-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theory-panel.component.html',
  styleUrls: ['./theory-panel.component.css']
})
export class TheoryPanelComponent implements OnInit, OnDestroy {
  @Input() topic!: 'calculator' | 'sets' | 'matrices';
  @Input() title: string = 'Теоретический материал';
  @Input() showTitle: boolean = true;
  @Input() collapsible: boolean = true;
  @Input() initiallyExpanded: boolean = true;
  @Input() maxHeight: string = '500px';
  @Input() size: 'compact' | 'normal' = 'compact';

  sections: TheorySection[] = [];
  isExpanded: boolean = true;
  isLoading: boolean = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private theoryService: TheoryService) {}

  ngOnInit(): void {
    this.isExpanded = this.initiallyExpanded;
    this.loadTheory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTheory(): void {
    this.isLoading = true;
    this.error = null;

    this.theoryService.getTheoryByTopic(this.topic)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sections) => {
          this.sections = sections;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Не удалось загрузить теоретический материал';
          this.isLoading = false;
          console.error('Ошибка загрузки теории:', err);
        }
      });
  }

  toggleExpanded(): void {
    if (this.collapsible) {
      this.isExpanded = !this.isExpanded;
    }
  }

  getSafeHtml(html: string): string {
    return html;
  }

  getPanelSizeClass(): string {
    return this.size === 'normal' ? 'normal-size' : 'compact-size';
  }

  getTopicIcon(): string {
    const icons = {
      calculator: '🧮',
      sets: '🔢',
      matrices: '📊'
    };
    return icons[this.topic] || '📚';
  }
}
