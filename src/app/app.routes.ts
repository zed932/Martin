import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';
import { AuthComponent } from './auth/auth.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { TestComponent } from './components/test/test.component';

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent
  },

  {
    path: 'test/:id',
    component: TestComponent,
    canActivate: [authGuard]
  },

  // Новая страница тестов для студентов
  {
    path: 'tests',
    loadComponent: () => import('./components/tests-list/tests-list.component').then(m => m.TestsListComponent),
    canActivate: [authGuard]
  },

  // Страница результатов тестов для студентов
  {
    path: 'my-test-results',
    loadComponent: () => import('./components/my-test-results/my-test-results.component').then(m => m.MyTestResultsComponent),
    canActivate: [authGuard]
  },

  // Auth routes
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'registration',
        loadComponent: () => import('./auth/registration/registration.component').then(m => m.RegistrationComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Main platform routes (protected)
  {
    path: 'calculator',
    loadComponent: () => import('./components/calculator/calculator.component').then(m => m.CalculatorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'set-calculator',
    loadComponent: () => import('./components/set-calculator/set-calculator.component').then(m => m.SetCalculatorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'matrix-calculator',
    loadComponent: () => import('./components/matrix-calculator/matrix-calculator.component').then(m => m.MatrixCalculatorComponent),
    canActivate: [authGuard]
  },

  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: ''
  }
];
