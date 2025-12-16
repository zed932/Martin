import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as setOps from 'set-operations';
import { TheoryPanelComponent } from '../theory-panel/theory-panel.component';

interface Set {
  name: string;
  elements: number[];
}

interface Point {
  x: number;
  y: number;
}

interface QuickOperation {
  label: string;
  expression: string;
}

interface DiagramRegion {
  path: string;
  fill: string;
  stroke: string;
}

@Component({
  selector: 'app-set-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, TheoryPanelComponent],
  templateUrl: './set-calculator.component.html',
  styleUrls: ['./set-calculator.component.css']
})
export class SetCalculatorComponent {
  // Основные данные - только 3 множества
  sets: Set[] = [
    { name: 'A', elements: [1, 2, 3, 4, 5] },
    { name: 'B', elements: [3, 4, 5, 6, 7, 8] },
    { name: 'C', elements: [5, 6, 7, 9, 10] }
  ];

  newSetName: string = '';
  newSetElements: string = '';
  currentExpression: string = '';
  showResults: boolean = false;

  // Состояние отображения
  highlightedSet: string = '';
  resultSet: number[] = [];
  currentOperationType: string = '';
  usedSets: string[] = [];

  // Конфигурация диаграммы
  diagramWidth: number = 500;
  diagramHeight: number = 400;
  circleRadius: number = 85;

  private elementPositions: Map<number, Point> = new Map();

  // Цвета для множеств
  private circleColors: { [key: string]: { fill: string, stroke: string, hatch: string } } = {
    'A': {
      fill: 'url(#hatch-red)',
      stroke: '#ff0000',
      hatch: 'rgba(255, 0, 0, 0.3)'
    },
    'B': {
      fill: 'url(#hatch-blue)',
      stroke: '#0000ff',
      hatch: 'rgba(0, 0, 255, 0.3)'
    },
    'C': {
      fill: 'url(#hatch-green)',
      stroke: '#00aa00',
      hatch: 'rgba(0, 170, 0, 0.3)'
    }
  };

  // Быстрые операции для 3 множеств
  private quickOperationsList: QuickOperation[] = [
    { label: 'A ∩ B', expression: 'A ∩ B' },
    { label: 'A ∪ B', expression: 'A ∪ B' },
    { label: 'A \\ B', expression: 'A \\ B' },
    { label: 'A ∆ B', expression: 'A ∆ B' },
    { label: 'A ∩ B ∩ C', expression: 'A ∩ B ∩ C' },
    { label: 'A ∪ B ∪ C', expression: 'A ∪ B ∪ C' },
    { label: '(A ∪ B) ∩ C', expression: '(A ∪ B) ∩ C' },
    { label: 'A \ (B ∪ C)', expression: 'A \\ (B ∪ C)' }
  ];

  constructor() {
    this.initializeElementPositions();
  }

  // ========== Управление множествами ==========
  getUniversalSet(): number[] {
    const allElements: number[] = [];
    this.sets.forEach(set => {
      allElements.push(...set.elements);
    });

    // Получаем уникальные элементы
    return Array.from(new Set(allElements)).sort((a: number, b: number) => a - b);
  }

  updateSet() {
    if (!this.newSetName) {
      alert('Выберите множество для обновления');
      return;
    }

    // Проверяем, что выбранное множество существует в нашем списке
    const availableSets = ['A', 'B', 'C'];
    if (!availableSets.includes(this.newSetName)) {
      alert('Доступны только множества A, B и C');
      return;
    }

    const elements = this.parseElements(this.newSetElements);
    const setIndex = this.sets.findIndex(s => s.name === this.newSetName);

    if (setIndex !== -1) {
      this.sets[setIndex].elements = elements;
    } else {
      this.sets.push({
        name: this.newSetName,
        elements: elements
      });
    }

    this.initializeElementPositions();
    this.newSetName = '';
    this.newSetElements = '';
  }

  clearSet() {
    if (!this.newSetName) {
      alert('Выберите множество для очистки');
      return;
    }

    const setIndex = this.sets.findIndex(s => s.name === this.newSetName);
    if (setIndex !== -1) {
      this.sets[setIndex].elements = [];
    }

    this.newSetName = '';
    this.newSetElements = '';
  }

  editSet(setName: string) {
    const set = this.sets.find(s => s.name === setName);
    if (set) {
      this.newSetName = setName;
      this.newSetElements = set.elements.join(', ');
    }
  }

  private parseElements(input: string): number[] {
    return input.split(',')
      .map(el => el.trim())
      .filter(el => el !== '')
      .map(el => parseInt(el, 10))
      .filter(el => !isNaN(el))
      .sort((a: number, b: number) => a - b);
  }

  // ========== Работа с выражениями ==========
  appendToExpression(value: string) {
    // Проверяем, что добавляется только разрешенное множество
    if (['A', 'B', 'C'].includes(value)) {
      // Если в выражении уже есть 3 разных множества, не добавляем новое
      const currentSets = this.extractUsedSetsFromExpression(this.currentExpression + value);
      if (currentSets.length > 3) {
        alert('Максимум 3 множества в выражении');
        return;
      }
    }
    this.currentExpression += value;
  }

  private extractUsedSetsFromExpression(expr: string): string[] {
    const used: string[] = [];
    const setNames = ['A', 'B', 'C'];

    for (const setName of setNames) {
      if (expr.includes(setName)) {
        used.push(setName);
      }
    }
    return Array.from(new Set(used)); // Уникальные значения
  }

  clearExpression() {
    this.currentExpression = '';
    this.showResults = false;
    this.highlightedSet = '';
    this.resultSet = [];
    this.currentOperationType = '';
    this.usedSets = [];
  }

  backspaceExpression() {
    this.currentExpression = this.currentExpression.slice(0, -1);
  }

  loadExample(expression: string) {
    // Проверяем, что в примере не больше 3 множеств
    const setsInExample = this.extractUsedSetsFromExpression(expression);
    if (setsInExample.length > 3) {
      alert('Пример содержит больше 3 множеств. Выберите другой пример.');
      return;
    }
    this.currentExpression = expression;
  }

  quickOperation(expression: string) {
    this.currentExpression = expression;
    this.calculateExpression();
  }

  getQuickOperations(): QuickOperation[] {
    return this.quickOperationsList;
  }

  // ========== Вычисление выражений ==========
  calculateExpression() {
    try {
      // Проверяем количество множеств в выражении
      this.usedSets = this.extractUsedSetsFromExpression(this.currentExpression);
      if (this.usedSets.length > 3) {
        alert('Максимум 3 множества в выражении');
        return;
      }

      // Определяем тип операции
      this.currentOperationType = this.determineOperationType(this.currentExpression);

      // Вычисляем результат
      this.resultSet = this.evaluateExpressionWithSetOps(this.currentExpression);
      this.showResults = true;
      this.highlightedSet = '';

      console.log('Вычисление:', {
        выражение: this.currentExpression,
        множества: this.usedSets,
        операция: this.currentOperationType,
        результат: this.resultSet
      });
    } catch (error) {
      console.error('Ошибка вычисления:', error);
      alert('Ошибка в выражении: ' + error);
      this.resultSet = [];
    }
  }

  private determineOperationType(expression: string): string {
    // Убираем пробелы для упрощения проверки
    const expr = expression.replace(/\s+/g, '');

    if (expr.includes('∩')) {
      return 'intersection';
    }
    if (expr.includes('∪')) return 'union';
    if (expr.includes('\\')) return 'difference';
    if (expr.includes('∆')) return 'symmetricDifference';
    return 'simple';
  }

  private evaluateExpressionWithSetOps(expr: string): number[] {
    try {
      // Упрощаем выражение
      expr = expr.replace(/\s+/g, '');

      // Используем стек для обработки скобок
      return this.evaluateExpression(expr);
    } catch (error) {
      throw new Error('Неверный формат выражения');
    }
  }

  private evaluateExpression(expr: string): number[] {
    // Простой парсер для выражений с операциями
    let result: number[] = [];
    let currentOp = '';
    let i = 0;

    while (i < expr.length) {
      const char = expr[i];

      if (['A', 'B', 'C'].includes(char)) {
        const set = this.getSetByName(char);

        if (result.length === 0) {
          result = set;
        } else if (currentOp === '∩') {
          result = this.intersection(result, set);
        } else if (currentOp === '∪') {
          result = this.union(result, set);
        } else if (currentOp === '\\') {
          result = this.difference(result, set);
        } else if (currentOp === '∆') {
          result = this.symmetricDifference(result, set);
        }
        currentOp = '';
      } else if (['∩', '∪', '\\', '∆'].includes(char)) {
        currentOp = char;
      } else if (char === '(') {
        // Находим закрывающую скобку
        let depth = 1;
        let j = i + 1;
        while (j < expr.length && depth > 0) {
          if (expr[j] === '(') depth++;
          if (expr[j] === ')') depth--;
          j++;
        }

        const subExpr = expr.substring(i + 1, j - 1);
        const subResult = this.evaluateExpression(subExpr);

        if (result.length === 0) {
          result = subResult;
        } else if (currentOp === '∩') {
          result = this.intersection(result, subResult);
        } else if (currentOp === '∪') {
          result = this.union(result, subResult);
        } else if (currentOp === '\\') {
          result = this.difference(result, subResult);
        } else if (currentOp === '∆') {
          result = this.symmetricDifference(result, subResult);
        }

        i = j - 1;
        currentOp = '';
      }
      i++;
    }

    return result;
  }

  private getSetByName(name: string): number[] {
    const set = this.sets.find(s => s.name === name);
    return set ? [...set.elements] : [];
  }

  getOperationTypeText(): string {
    switch (this.currentOperationType) {
      case 'intersection': return 'Пересечение';
      case 'union': return 'Объединение';
      case 'difference': return 'Разность';
      case 'symmetricDifference': return 'Симметрическая разность';
      default: return 'Простое множество';
    }
  }

  // ========== Операции с множествами ==========
  private intersection(setA: number[], setB: number[]): number[] {
    const result = setOps.intersection(setA, setB);
    return Array.isArray(result) ? result as number[] : [];
  }

  private union(setA: number[], setB: number[]): number[] {
    const result = setOps.union(setA, setB);
    return Array.isArray(result) ? result as number[] : [];
  }

  private difference(setA: number[], setB: number[]): number[] {
    const result = setOps.difference(setA, setB);
    return Array.isArray(result) ? result as number[] : [];
  }

  private symmetricDifference(setA: number[], setB: number[]): number[] {
    const result = setOps.symmetricDifference(setA, setB);
    return Array.isArray(result) ? result as number[] : [];
  }

  // ========== Визуализация ==========
  getUsedSets(): string[] {
    return this.usedSets;
  }

  // Получить ВСЕ множества для отображения меток
  getAllSetsForLabels(): string[] {
    return ['A', 'B', 'C'];
  }

  getCirclePosition(setName: string): Point {
    const sets = this.getUsedSets();
    const count = sets.length;
    const index = sets.indexOf(setName);
    const centerX = this.diagramWidth / 2;
    const centerY = this.diagramHeight / 2;

    if (count === 1) {
      // Одно множество - по центру
      return { x: centerX, y: centerY };
    } else if (count === 2) {
      // Два множества - горизонтально с пересечением
      const distance = this.circleRadius * 0.7;
      if (index === 0) {
        return { x: centerX - distance/2, y: centerY };
      } else {
        return { x: centerX + distance/2, y: centerY };
      }
    } else if (count === 3) {
      // Три множества - равносторонний треугольник
      const radius = this.circleRadius * 1.0;

      // Определяем позиции для A, B, C в треугольнике
      const positions = {
        'A': {
          x: centerX,
          y: centerY - radius * 0.5  // Смещено вниз
        },
        'B': {
          x: centerX - radius * 0.6,
          y: centerY + radius * 0.3   // Смещено вверх
        },
        'C': {
          x: centerX + radius * 0.6,
          y: centerY + radius * 0.3   // Смещено вверх
        }
      };

      return positions[setName as keyof typeof positions] || { x: centerX, y: centerY };
    } else {
      return { x: centerX, y: centerY };
    }
  }

  getCircleStroke(setName: string): string {
    return this.circleColors[setName]?.stroke || 'gray';
  }

  getHatchFill(setName: string): string {
    // Более яркие цвета при просмотре отдельного множества
    const colors: {[key: string]: string} = {
      'A': 'rgba(255, 0, 0, 0.4)',
      'B': 'rgba(0, 0, 255, 0.4)',
      'C': 'rgba(0, 170, 0, 0.4)',
    };
    return colors[setName] || 'rgba(128, 128, 128, 0.4)';
  }

  getDiagramViewBox(): string {
    const padding = 60;
    return `-${padding} -${padding} ${this.diagramWidth + padding * 2} ${this.diagramHeight + padding * 2}`;
  }

  // ========== Регионы для операций ==========
  getIntersectionRegions(): DiagramRegion[] {
    const sets = this.getUsedSets();
    const regions: DiagramRegion[] = [];

    if (sets.length === 2 && this.currentOperationType === 'intersection') {
      // Пересечение двух множеств - выделяем только область пересечения
      const pos1 = this.getCirclePosition(sets[0]);
      const pos2 = this.getCirclePosition(sets[1]);
      const r = this.circleRadius;

      const intersectionPath = this.getTwoCirclesIntersectionPath(pos1, pos2, r);
      if (intersectionPath) {
        regions.push({
          path: intersectionPath,
          fill: 'rgba(255, 0, 0, 0.7)', // Ярко-красный для пересечения
          stroke: '#ff0000'
        });
      }

    } else if (sets.length === 3 && this.currentOperationType === 'intersection') {
      // Проверяем конкретные выражения для трех множеств
      const expr = this.currentExpression.replace(/\s+/g, '');

      if (expr === 'A∩B∩C' || expr === 'A∩C∩B' || expr === 'B∩A∩C' ||
        expr === 'B∩C∩A' || expr === 'C∩A∩B' || expr === 'C∩B∩A') {
        // Пересечение трех множеств A ∩ B ∩ C - выделяем центральную область
        const posA = this.getCirclePosition('A');
        const posB = this.getCirclePosition('B');
        const posC = this.getCirclePosition('C');
        const r = this.circleRadius;

        // Вычисляем область пересечения всех трех кругов
        const tripleIntersectionPath = this.getThreeCirclesIntersectionPath(posA, posB, posC, r);
        if (tripleIntersectionPath) {
          regions.push({
            path: tripleIntersectionPath,
            fill: 'rgba(255, 0, 0, 0.7)', // Ярко-красный
            stroke: '#ff0000',
          });
        }
      } else if (expr === '(A∪B)∩C' || expr === '(B∪A)∩C') {
        // (A∪B)∩C - выделяем области пересечения A∩C и B∩C
        const posA = this.getCirclePosition('A');
        const posB = this.getCirclePosition('B');
        const posC = this.getCirclePosition('C');
        const r = this.circleRadius;

        // Область пересечения A и C
        const intersectionAC = this.getTwoCirclesIntersectionPath(posA, posC, r);
        if (intersectionAC) {
          regions.push({
            path: intersectionAC,
            fill: 'rgba(255, 0, 0, 0.7)', // Ярко-красный
            stroke: '#ff0000',
          });
        }

        // Область пересечения B и C
        const intersectionBC = this.getTwoCirclesIntersectionPath(posB, posC, r);
        if (intersectionBC) {
          regions.push({
            path: intersectionBC,
            fill: 'rgba(0, 0, 255, 0.7)', // Ярко-синий
            stroke: '#0000ff',
          });
        }
      } else if (expr === 'A∩C' || expr === 'C∩A') {
        // A ∩ C - только пересечение A и C
        const posA = this.getCirclePosition('A');
        const posC = this.getCirclePosition('C');
        const r = this.circleRadius;

        const intersectionAC = this.getTwoCirclesIntersectionPath(posA, posC, r);
        if (intersectionAC) {
          regions.push({
            path: intersectionAC,
            fill: 'rgba(255, 0, 0, 0.7)', // Ярко-красный
            stroke: '#ff0000',
          });
        }
      } else if (expr === 'B∩C' || expr === 'C∩B') {
        // B ∩ C - только пересечение B и C
        const posB = this.getCirclePosition('B');
        const posC = this.getCirclePosition('C');
        const r = this.circleRadius;

        const intersectionBC = this.getTwoCirclesIntersectionPath(posB, posC, r);
        if (intersectionBC) {
          regions.push({
            path: intersectionBC,
            fill: 'rgba(0, 0, 255, 0.7)', // Ярко-синий
            stroke: '#0000ff',
          });
        }
      }
    }

    return regions;
  }

  private getTwoCirclesIntersectionPath(pos1: Point, pos2: Point, r: number): string {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d >= 2 * r || d === 0) {
      return ''; // Круги не пересекаются или совпадают
    }

    // Вычисляем точки пересечения
    const a = (r * r - r * r + d * d) / (2 * d);
    const h = Math.sqrt(r * r - a * a);

    const x0 = pos1.x + a * dx / d;
    const y0 = pos1.y + a * dy / d;

    const x1 = x0 - h * dy / d;
    const y1 = y0 + h * dx / d;
    const x2 = x0 + h * dy / d;
    const y2 = y0 - h * dx / d;

    // Вычисляем углы
    const angle1 = Math.atan2(y1 - pos1.y, x1 - pos1.x);
    const angle2 = Math.atan2(y2 - pos1.y, x2 - pos1.x);

    const angle3 = Math.atan2(y2 - pos2.y, x2 - pos2.x);
    const angle4 = Math.atan2(y1 - pos2.y, x1 - pos2.x);

    return `
      M ${x1},${y1}
      A ${r},${r} 0 ${Math.abs(angle2 - angle1) > Math.PI ? 1 : 0} 0 ${x2},${y2}
      A ${r},${r} 0 0,0 ${x1},${y1}
      Z
    `;
  }

  private getThreeCirclesIntersectionPath(posA: Point, posB: Point, posC: Point, r: number): string {
    // Находим центроид (центр масс) трех точек
    const centroidX = (posA.x + posB.x + posC.x) / 3;
    const centroidY = (posA.y + posB.y + posC.y) / 3;

    // Проверяем, находится ли центроид внутри всех трех кругов
    const inA = this.isPointInCircle({x: centroidX, y: centroidY}, posA, r);
    const inB = this.isPointInCircle({x: centroidX, y: centroidY}, posB, r);
    const inC = this.isPointInCircle({x: centroidX, y: centroidY}, posC, r);

    if (!inA || !inB || !inC) {
      // Если центроид не внутри всех кругов, пересечение может быть пустым или очень маленьким
      // Ищем точки пересечения пар кругов, которые находятся внутри третьего круга
      const points: Point[] = [];

      // Точки пересечения A и B внутри C
      const abPoints = this.getTwoCirclesIntersectionPoints(posA, posB, r);
      points.push(...abPoints.filter(p => this.isPointInCircle(p, posC, r)));

      // Точки пересечения B и C внутри A
      const bcPoints = this.getTwoCirclesIntersectionPoints(posB, posC, r);
      points.push(...bcPoints.filter(p => this.isPointInCircle(p, posA, r)));

      // Точки пересечения C и A внутри B
      const caPoints = this.getTwoCirclesIntersectionPoints(posC, posA, r);
      points.push(...caPoints.filter(p => this.isPointInCircle(p, posB, r)));

      if (points.length === 0) {
        return ''; // Нет пересечения
      }

      // Удаляем дубликаты
      const uniquePoints = this.removeDuplicatePoints(points);

      if (uniquePoints.length < 3) {
        // Если точек мало, создаем маленький круг в их центре
        const avgX = uniquePoints.reduce((sum, p) => sum + p.x, 0) / uniquePoints.length;
        const avgY = uniquePoints.reduce((sum, p) => sum + p.y, 0) / uniquePoints.length;
        return this.getCirclePath(avgX, avgY, r * 0.1);
      }

      // Сортируем точки для создания полигона
      const sortedPoints = this.sortPointsByAngle(uniquePoints);
      return this.pointsToPath(sortedPoints);
    }

    // Если центроид внутри всех кругов, создаем многоугольник в области пересечения
    const points: Point[] = [];

    // 8 направлений для создания восьмиугольника
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const point = this.findIntersectionBoundaryPoint(centroidX, centroidY, angle, posA, posB, posC, r);
      if (point) {
        points.push(point);
      }
    }

    if (points.length === 0) {
      // Запасной вариант: маленький круг в центроиде
      return this.getCirclePath(centroidX, centroidY, r * 0.2);
    }

    const sortedPoints = this.sortPointsByAngle(points);
    return this.pointsToPath(sortedPoints);
  }

  private getTwoCirclesIntersectionPoints(pos1: Point, pos2: Point, r: number): Point[] {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d > 2 * r || d === 0) {
      return []; // Круги не пересекаются или совпадают
    }

    const a = (r * r - r * r + d * d) / (2 * d);
    const h = Math.sqrt(r * r - a * a);

    const x0 = pos1.x + a * dx / d;
    const y0 = pos1.y + a * dy / d;

    const x1 = x0 - h * dy / d;
    const y1 = y0 + h * dx / d;
    const x2 = x0 + h * dy / d;
    const y2 = y0 - h * dx / d;

    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ];
  }

  private isPointInCircle(point: Point, center: Point, radius: number): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }

  private findIntersectionBoundaryPoint(
    startX: number, startY: number, angle: number,
    posA: Point, posB: Point, posC: Point, r: number
  ): Point | null {
    // Ищем точку на луче, которая находится на границе пересечения
    const step = r / 50;
    let dist = 0;
    let lastInsidePoint: Point | null = null;

    while (dist < r * 2) {
      const x = startX + Math.cos(angle) * dist;
      const y = startY + Math.sin(angle) * dist;

      const inA = this.isPointInCircle({x, y}, posA, r);
      const inB = this.isPointInCircle({x, y}, posB, r);
      const inC = this.isPointInCircle({x, y}, posC, r);

      if (inA && inB && inC) {
        lastInsidePoint = {x, y};
      } else if (lastInsidePoint) {
        // Нашли границу - возвращаем последнюю точку внутри
        return lastInsidePoint;
      }

      dist += step;
    }

    return lastInsidePoint; // Если не нашли границу, возвращаем последнюю внутреннюю
  }

  private removeDuplicatePoints(points: Point[]): Point[] {
    const unique: Point[] = [];
    const tolerance = 0.1;

    points.forEach(point => {
      if (!unique.some(p =>
        Math.abs(p.x - point.x) < tolerance &&
        Math.abs(p.y - point.y) < tolerance
      )) {
        unique.push(point);
      }
    });

    return unique;
  }

  private sortPointsByAngle(points: Point[]): Point[] {
    if (points.length === 0) return [];

    // Находим центр всех точек
    const center = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };

    // Сортируем по углу относительно центра
    return [...points].sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });
  }

  private pointsToPath(points: Point[]): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    path += ' Z';

    return path;
  }

  // ========== РАЗНОСТЬ МНОЖЕСТВ (КОРРЕКТНАЯ ВИЗУАЛИЗАЦИЯ) ==========
  getDifferenceRegions(): DiagramRegion[] {
    const sets = this.getUsedSets();
    const regions: DiagramRegion[] = [];

    if (sets.length === 2 && this.currentOperationType === 'difference') {
      const expr = this.currentExpression.replace(/\s+/g, '');

      // Определяем направление разности
      const isAminusB = expr === 'A\\B' || expr === 'A-B';
      const isBminusA = expr === 'B\\A' || expr === 'B-A';

      const posA = this.getCirclePosition('A');
      const posB = this.getCirclePosition('B');
      const r = this.circleRadius;

      if (isAminusB) {
        // A \ B - закрашиваем часть A, которая НЕ входит в B (левая часть A)
        const differencePath = this.getAMinusBPath(posA, posB, r);
        if (differencePath) {
          regions.push({
            path: differencePath,
            fill: 'rgba(255, 0, 0, 0.7)', // Ярко-красный
            stroke: '#ff0000'
          });
        }
      } else if (isBminusA) {
        // B \ A - закрашиваем часть B, которая НЕ входит в A (правая часть B)
        const differencePath = this.getBMinusAPath(posA, posB, r);
        if (differencePath) {
          regions.push({
            path: differencePath,
            fill: 'rgba(0, 0, 255, 0.7)', // Ярко-синий
            stroke: '#0000ff'
          });
        }
      } else {
        // Общий случай для двух множеств
        const pos1 = this.getCirclePosition(sets[0]);
        const pos2 = this.getCirclePosition(sets[1]);
        const differencePath = this.getGeneralDifferencePath(pos1, pos2, r);
        if (differencePath) {
          regions.push({
            path: differencePath,
            fill: 'rgba(255, 0, 0, 0.7)', // Ярко-красный
            stroke: '#ff0000'
          });
        }
      }
    }

    return regions;
  }

  // ТОЧНО A \ B (левая часть круга A)
  private getAMinusBPath(posA: Point, posB: Point, r: number): string {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d >= 2 * r) {
      // Круги не пересекаются - весь круг A
      return this.getCirclePath(posA.x, posA.y, r);
    }

    if (d <= 0) {
      // Круги совпадают - ничего не выделяем
      return '';
    }

    // Вычисляем точки пересечения
    const a = (r * r - r * r + d * d) / (2 * d);
    const h = Math.sqrt(r * r - a * a);

    const x0 = posA.x + a * dx / d;
    const y0 = posA.y + a * dy / d;

    const x1 = x0 - h * dy / d;
    const y1 = y0 + h * dx / d;
    const x2 = x0 + h * dy / d;
    const y2 = y0 - h * dx / d;

    // Определяем, какая точка находится СЛЕВА от направления A→B
    // Вектор A→B
    const vectorAB = { x: dx, y: dy };

    // Векторы к точкам пересечения
    const vectorAP1 = { x: x1 - posA.x, y: y1 - posA.y };
    const vectorAP2 = { x: x2 - posA.x, y: y2 - posA.y };

    // Векторные произведения (cross product)
    const cross1 = vectorAB.x * vectorAP1.y - vectorAB.y * vectorAP1.x;
    const cross2 = vectorAB.x * vectorAP2.y - vectorAB.y * vectorAP2.x;

    // Если cross > 0, точка слева от вектора AB
    // Для A \ B нам нужна ЛЕВАЯ часть круга A

    let leftPoint, rightPoint;
    if (cross1 > 0 && cross2 < 0) {
      // P1 слева, P2 справа
      leftPoint = { x: x1, y: y1 };
      rightPoint = { x: x2, y: y2 };
    } else if (cross1 < 0 && cross2 > 0) {
      // P2 слева, P1 справа
      leftPoint = { x: x2, y: y2 };
      rightPoint = { x: x1, y: y1 };
    } else {
      // Непонятно, берем стандартный вариант
      leftPoint = { x: x1, y: y1 };
      rightPoint = { x: x2, y: y2 };
    }

    // Вычисляем углы
    const leftAngle = Math.atan2(leftPoint.y - posA.y, leftPoint.x - posA.x);
    const rightAngle = Math.atan2(rightPoint.y - posA.y, rightPoint.x - posA.x);

    // Для A \ B нужна БОЛЬШАЯ дуга слева (против часовой стрелки от leftPoint до rightPoint)
    let startAngle = leftAngle;
    let endAngle = rightAngle;

    // Нормализуем углы
    if (endAngle < startAngle) {
      endAngle += 2 * Math.PI;
    }

    // Это должна быть БОЛЬШАЯ дуга (внешняя часть)
    // Если получилась малая дуга, берем противоположную
    if (Math.abs(endAngle - startAngle) < Math.PI) {
      // Меняем местами и добавляем 2π
      startAngle = rightAngle;
      endAngle = leftAngle + 2 * Math.PI;
    }

    const largeArcFlag = 1; // Всегда большая дуга для внешней части

    const startX = posA.x + r * Math.cos(startAngle);
    const startY = posA.y + r * Math.sin(startAngle);
    const endX = posA.x + r * Math.cos(endAngle);
    const endY = posA.y + r * Math.sin(endAngle);

    return `
      M ${startX},${startY}
      A ${r},${r} 0 ${largeArcFlag} 1 ${endX},${endY}
      A ${r},${r} 0 ${largeArcFlag} 1 ${startX},${startY}
      Z
    `;
  }

  // ТОЧНО B \ A (правая часть круга B)
  private getBMinusAPath(posA: Point, posB: Point, r: number): string {
    // B \ A симметрично A \ B, только меняем роли кругов
    // Правая часть B = левая часть B относительно направления B→A

    const dx = posA.x - posB.x;  // Направление от B к A
    const dy = posA.y - posB.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d >= 2 * r) {
      // Круги не пересекаются - весь круг B
      return this.getCirclePath(posB.x, posB.y, r);
    }

    if (d <= 0) {
      // Круги совпадают - ничего не выделяем
      return '';
    }

    // Вычисляем точки пересечения (относительно B)
    const a = (r * r - r * r + d * d) / (2 * d);
    const h = Math.sqrt(r * r - a * a);

    const x0 = posB.x + a * dx / d;
    const y0 = posB.y + a * dy / d;

    const x1 = x0 - h * dy / d;
    const y1 = y0 + h * dx / d;
    const x2 = x0 + h * dy / d;
    const y2 = y0 - h * dx / d;

    // Определяем, какая точка находится СЛЕВА от направления B→A
    // Вектор B→A
    const vectorBA = { x: dx, y: dy };

    // Векторы к точкам пересечения
    const vectorBP1 = { x: x1 - posB.x, y: y1 - posB.y };
    const vectorBP2 = { x: x2 - posB.x, y: y2 - posB.y };

    // Векторные произведения (cross product)
    const cross1 = vectorBA.x * vectorBP1.y - vectorBA.y * vectorBP1.x;
    const cross2 = vectorBA.x * vectorBP2.y - vectorBA.y * vectorBP2.x;

    // Если cross > 0, точка слева от вектора BA
    // Левая часть B относительно B→A = правая часть B относительно A→B

    let leftPoint, rightPoint;
    if (cross1 > 0 && cross2 < 0) {
      // P1 слева (относительно B→A), P2 справа
      leftPoint = { x: x1, y: y1 };  // Это будет ПРАВАЯ часть B для B \ A
      rightPoint = { x: x2, y: y2 };
    } else if (cross1 < 0 && cross2 > 0) {
      // P2 слева, P1 справа
      leftPoint = { x: x2, y: y2 };  // Это будет ПРАВАЯ часть B для B \ A
      rightPoint = { x: x1, y: y1 };
    } else {
      // Непонятно, берем стандартный вариант
      leftPoint = { x: x1, y: y1 };
      rightPoint = { x: x2, y: y2 };
    }

    // Вычисляем углы
    const leftAngle = Math.atan2(leftPoint.y - posB.y, leftPoint.x - posB.x);
    const rightAngle = Math.atan2(rightPoint.y - posB.y, rightPoint.x - posB.x);

    // Для B \ A нужна БОЛЬШАЯ дуга слева (против часовой стрелки от leftPoint до rightPoint)
    let startAngle = leftAngle;
    let endAngle = rightAngle;

    // Нормализуем углы
    if (endAngle < startAngle) {
      endAngle += 2 * Math.PI;
    }

    // Это должна быть БОЛЬШАЯ дуга (внешняя часть)
    // Если получилась малая дуга, берем противоположную
    if (Math.abs(endAngle - startAngle) < Math.PI) {
      // Меняем местами и добавляем 2π
      startAngle = rightAngle;
      endAngle = leftAngle + 2 * Math.PI;
    }

    const largeArcFlag = 1; // Всегда большая дуга для внешней части

    const startX = posB.x + r * Math.cos(startAngle);
    const startY = posB.y + r * Math.sin(startAngle);
    const endX = posB.x + r * Math.cos(endAngle);
    const endY = posB.y + r * Math.sin(endAngle);

    return `
      M ${startX},${startY}
      A ${r},${r} 0 ${largeArcFlag} 1 ${endX},${endY}
      A ${r},${r} 0 ${largeArcFlag} 1 ${startX},${startY}
      Z
    `;
  }

  // Общий метод разности (для других случаев)
  private getGeneralDifferencePath(pos1: Point, pos2: Point, r: number): string {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d >= 2 * r) {
      // Круги не пересекаются - весь первый круг
      return this.getCirclePath(pos1.x, pos1.y, r);
    }

    if (d <= 0) {
      // Круги совпадают - ничего не выделяем
      return '';
    }

    // Вычисляем точки пересечения
    const a = (r * r - r * r + d * d) / (2 * d);
    const h = Math.sqrt(r * r - a * a);

    const x0 = pos1.x + a * dx / d;
    const y0 = pos1.y + a * dy / d;

    const x1 = x0 - h * dy / d;
    const y1 = y0 + h * dx / d;
    const x2 = x0 + h * dy / d;
    const y2 = y0 - h * dx / d;

    // Вычисляем углы
    const angle1 = Math.atan2(y1 - pos1.y, x1 - pos1.x);
    const angle2 = Math.atan2(y2 - pos1.y, x2 - pos1.x);

    // Для разности берем БОЛЬШУЮ дугу (внешнюю часть)
    let startAngle = angle1;
    let endAngle = angle2;

    if (endAngle < startAngle) {
      endAngle += 2 * Math.PI;
    }

    // Если получилась малая дуга, берем противоположную (большую)
    if (Math.abs(endAngle - startAngle) < Math.PI) {
      startAngle = angle2;
      endAngle = angle1 + 2 * Math.PI;
    }

    const largeArcFlag = 1;

    const startX = pos1.x + r * Math.cos(startAngle);
    const startY = pos1.y + r * Math.sin(startAngle);
    const endX = pos1.x + r * Math.cos(endAngle);
    const endY = pos1.y + r * Math.sin(endAngle);

    return `
      M ${startX},${startY}
      A ${r},${r} 0 ${largeArcFlag} 1 ${endX},${endY}
      A ${r},${r} 0 ${largeArcFlag} 1 ${startX},${startY}
      Z
    `;
  }

  getSymmetricDifferenceRegions(): DiagramRegion[] {
    const sets = this.getUsedSets();
    const regions: DiagramRegion[] = [];

    if (sets.length === 2 && this.currentOperationType === 'symmetricDifference') {
      // Симметрическая разность A ∆ B - выделяем обе части, которые не пересекаются
      const posA = this.getCirclePosition('A');
      const posB = this.getCirclePosition('B');
      const r = this.circleRadius;

      // Левая часть (A \ B) - часть A без пересечения с B
      const leftPath = this.getAMinusBPath(posA, posB, r);
      if (leftPath) {
        regions.push({
          path: leftPath,
          fill: 'rgba(255, 0, 0, 0.7)', // Ярко-красный для A\B
          stroke: '#ff0000'
        });
      }

      // Правая часть (B \ A) - часть B без пересечения с A
      const rightPath = this.getBMinusAPath(posA, posB, r);
      if (rightPath) {
        regions.push({
          path: rightPath,
          fill: 'rgba(0, 0, 255, 0.7)', // Ярко-синий для B\A
          stroke: '#0000ff'
        });
      }
    }

    return regions;
  }

  getUnionRegions(): DiagramRegion[] {
    const sets = this.getUsedSets();
    const regions: DiagramRegion[] = [];

    if (sets.length === 2 && this.currentOperationType === 'union') {
      // Объединение двух множеств - выделяем ВЕСЬ контур обоих кругов
      const pos1 = this.getCirclePosition(sets[0]);
      const pos2 = this.getCirclePosition(sets[1]);
      const r = this.circleRadius;

      // Для объединения показываем оба круга полностью
      regions.push({
        path: this.getCirclePath(pos1.x, pos1.y, r),
        fill: 'rgba(255, 215, 0, 0.5)', // Полупрозрачный желтый
        stroke: '#ffd700'
      });

      regions.push({
        path: this.getCirclePath(pos2.x, pos2.y, r),
        fill: 'rgba(255, 215, 0, 0.5)', // Полупрозрачный желтый
        stroke: '#ffd700'
      });

    } else if (sets.length === 3 && this.currentOperationType === 'union') {
      // Объединение трех множеств - выделяем ВСЕ три круга
      ['A', 'B', 'C'].forEach(setName => {
        const pos = this.getCirclePosition(setName);
        const r = this.circleRadius;

        // Проверяем, что это множество используется в выражении
        if (this.usedSets.includes(setName)) {
          regions.push({
            path: this.getCirclePath(pos.x, pos.y, r),
            fill: 'rgba(255, 215, 0, 0.5)', // Полупрозрачный желтый
            stroke: '#ffd700'
          });
        }
      });
    }

    return regions;
  }

  // ========== Геометрия путей ==========
  private getCirclePath(x: number, y: number, r: number): string {
    return `M ${x - r},${y} a ${r},${r} 0 1,0 ${2 * r},0 a ${r},${r} 0 1,0 ${-2 * r},0`;
  }

  // ========== Работа с элементами ==========
  private initializeElementPositions() {
    this.elementPositions.clear();
    const universal = this.getUniversalSet();

    universal.forEach((element, index) => {
      const row = Math.floor(index / 10);
      const col = index % 10;
      const x = 50 + col * 40;
      const y = 100 + row * 30;
      this.elementPositions.set(element, { x, y });
    });
  }

  getElementPositionX(element: number, index?: number): number {
    if (index !== undefined && this.highlightedSet) {
      const pos = this.getCirclePosition(this.highlightedSet);
      const elements = this.getSetElements(this.highlightedSet);
      const count = elements.length;

      if (count === 0) return pos.x;

      const angle = (index * 2 * Math.PI / count) - Math.PI / 2;
      const radius = this.circleRadius * 0.6;
      return pos.x + radius * Math.cos(angle);
    }

    return this.elementPositions.get(element)?.x || this.diagramWidth / 2;
  }

  getElementPositionY(element: number, index?: number): number {
    if (index !== undefined && this.highlightedSet) {
      const pos = this.getCirclePosition(this.highlightedSet);
      const elements = this.getSetElements(this.highlightedSet);
      const count = elements.length;

      if (count === 0) return pos.y;

      const angle = (index * 2 * Math.PI / count) - Math.PI / 2;
      const radius = this.circleRadius * 0.6;
      return pos.y + radius * Math.sin(angle);
    }

    return this.elementPositions.get(element)?.y || this.diagramHeight / 2;
  }

  getSetElements(setName: string): number[] {
    const set = this.sets.find(s => s.name === setName);
    return set ? [...set.elements] : [];
  }

  // ========== Просмотр результатов ==========
  viewSet(setName: string) {
    this.highlightedSet = setName;
  }

  viewResult() {
    this.highlightedSet = '';
  }

  // Метод для получения заливки при просмотре отдельного множества
  getSetFillPath(setName: string): string {
    const pos = this.getCirclePosition(setName);
    return this.getCirclePath(pos.x, pos.y, this.circleRadius);
  }

  saveResultAsSet() {
    // Теперь можно сохранять только как A, B или C
    const newSetName = prompt('Введите имя для сохранения результата (A, B или C):', 'A');
    if (newSetName && ['A', 'B', 'C'].includes(newSetName)) {
      const setIndex = this.sets.findIndex(s => s.name === newSetName);
      if (setIndex !== -1) {
        this.sets[setIndex] = {
          name: newSetName,
          elements: [...this.resultSet].sort((a: number, b: number) => a - b)
        };
        alert(`Множество ${newSetName} обновлено!`);
        this.initializeElementPositions();
      }
    } else {
      alert('Допустимые имена: A, B, C');
    }
  }

  copyResultToClipboard() {
    const resultText = this.resultSet.length > 0 ? this.resultSet.join(', ') : '∅';
    navigator.clipboard.writeText(resultText)
      .then(() => alert('Результат скопирован в буфер обмена!'))
      .catch(err => alert('Ошибка копирования: ' + err));
  }

  // ========== Дополнительные операции ==========
  isSubset(setA: number[], setB: number[]): boolean {
    const intersectionSet = this.intersection(setA, setB);
    return intersectionSet.length === setA.length;
  }

  isSuperset(setA: number[], setB: number[]): boolean {
    return this.isSubset(setB, setA);
  }

  areDisjoint(setA: number[], setB: number[]): boolean {
    return this.intersection(setA, setB).length === 0;
  }

  complement(set: number[]): number[] {
    const universalSet = this.getUniversalSet();
    return this.difference(universalSet, set);
  }
}
