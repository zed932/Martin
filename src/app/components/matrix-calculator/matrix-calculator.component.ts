import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheoryPanelComponent } from '../theory-panel/theory-panel.component';

@Component({
  selector: 'app-matrix-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, TheoryPanelComponent],
  templateUrl: './matrix-calculator.component.html',
  styleUrls: ['./matrix-calculator.component.css']
})
export class MatrixCalculatorComponent {
  rows: number = 3;
  cols: number = 3;
  operation: string = '';

  matrixA: number[][] = [];
  matrixB: number[][] = [];
  resultMatrix: number[][] = [];

  constructor() {
    this.createMatrix();
  }

  createMatrix() {
    // Инициализация матрицы A
    this.matrixA = [];
    for (let i = 0; i < this.rows; i++) {
      this.matrixA[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.matrixA[i][j] = 0;
      }
    }

    // Инициализация матрицы B
    this.matrixB = [];
    for (let i = 0; i < this.rows; i++) {
      this.matrixB[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.matrixB[i][j] = 0;
      }
    }

    this.resultMatrix = [];
  }

  setOperation(op: string) {
    this.operation = op;
  }

  calculateMatrix() {
    switch (this.operation) {
      case 'add':
        this.matrixAddition();
        break;
      case 'subtract':
        this.matrixSubtraction();
        break;
      case 'multiply':
        this.matrixMultiplication();
        break;
      case 'transpose':
        this.matrixTranspose();
        break;
      case 'determinant':
        this.calculateDeterminant();
        break;
      default:
        alert('Выберите операцию');
    }
  }

  matrixAddition() {
    this.resultMatrix = [];
    for (let i = 0; i < this.rows; i++) {
      this.resultMatrix[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.resultMatrix[i][j] = this.matrixA[i][j] + this.matrixB[i][j];
      }
    }
  }

  matrixSubtraction() {
    this.resultMatrix = [];
    for (let i = 0; i < this.rows; i++) {
      this.resultMatrix[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.resultMatrix[i][j] = this.matrixA[i][j] - this.matrixB[i][j];
      }
    }
  }

  matrixMultiplication() {
    this.resultMatrix = [];
    for (let i = 0; i < this.rows; i++) {
      this.resultMatrix[i] = [];
      for (let j = 0; j < this.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.matrixA[i][k] * this.matrixB[k][j];
        }
        this.resultMatrix[i][j] = sum;
      }
    }
  }

  matrixTranspose() {
    this.resultMatrix = [];
    for (let i = 0; i < this.cols; i++) {
      this.resultMatrix[i] = [];
      for (let j = 0; j < this.rows; j++) {
        this.resultMatrix[i][j] = this.matrixA[j][i];
      }
    }
  }

  calculateDeterminant() {
    if (this.rows !== this.cols) {
      alert('Определитель можно вычислить только для квадратной матрицы');
      return;
    }

    if (this.rows === 2) {
      const det = this.matrixA[0][0] * this.matrixA[1][1] - this.matrixA[0][1] * this.matrixA[1][0];
      this.resultMatrix = [[det]];
    } else if (this.rows === 3) {
      const det =
        this.matrixA[0][0] * (this.matrixA[1][1] * this.matrixA[2][2] - this.matrixA[1][2] * this.matrixA[2][1]) -
        this.matrixA[0][1] * (this.matrixA[1][0] * this.matrixA[2][2] - this.matrixA[1][2] * this.matrixA[2][0]) +
        this.matrixA[0][2] * (this.matrixA[1][0] * this.matrixA[2][1] - this.matrixA[1][1] * this.matrixA[2][0]);
      this.resultMatrix = [[det]];
    } else {
      alert('Определитель для матриц больше 3x3 не реализован');
    }
  }
}
