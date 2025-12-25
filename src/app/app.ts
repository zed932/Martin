import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    @if (isAuthenticated) {
      <app-header />
    }
    <main class="main-container">
      <router-outlet />
    </main>
  `,
  styles: [`
    .main-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      min-height: calc(100vh - 80px);
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Подписываемся на изменения авторизации
    this.isAuthenticated = this.authService.isAuthenticated();

    // Простая проверка каждую секунду
    setInterval(() => {
      this.isAuthenticated = this.authService.isAuthenticated();
    }, 1000);
  }
}

export class App {
}
