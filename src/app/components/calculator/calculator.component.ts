import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheoryPanelComponent } from '../theory-panel/theory-panel.component';
@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule,TheoryPanelComponent],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  displayValue: string = '0';
  currentOperand: string = '';
  previousOperand: string = '';
  operation: string | null = null;
  waitingForNewOperand: boolean = false;

  appendNumber(number: string) {
    if (this.waitingForNewOperand) {
      this.displayValue = number;
      this.waitingForNewOperand = false;
    } else {
      this.displayValue = this.displayValue === '0' ? number : this.displayValue + number;
    }
  }

  appendDecimal() {
    if (this.waitingForNewOperand) {
      this.displayValue = '0.';
      this.waitingForNewOperand = false;
    } else if (this.displayValue.indexOf('.') === -1) {
      this.displayValue += '.';
    }
  }

  appendOperator(operator: string) {
    if (this.operation && !this.waitingForNewOperand) {
      this.calculate();
    }

    this.previousOperand = this.displayValue;
    this.operation = operator;
    this.waitingForNewOperand = true;
  }

  calculate() {
    if (!this.operation || this.waitingForNewOperand) return;

    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.displayValue);
    let result: number;

    switch (this.operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        result = prev / current;
        break;
      default:
        return;
    }

    this.displayValue = result.toString();
    this.operation = null;
    this.previousOperand = '';
    this.waitingForNewOperand = true;
  }

  clear() {
    this.displayValue = '0';
    this.currentOperand = '';
    this.previousOperand = '';
    this.operation = null;
    this.waitingForNewOperand = false;
  }

  backspace() {
    if (this.displayValue.length > 1) {
      this.displayValue = this.displayValue.slice(0, -1);
    } else {
      this.displayValue = '0';
    }
  }
}
