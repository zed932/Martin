import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'tests',
        loadComponent: () => import('./components/test-management/test-management.component').then(m => m.TestManagementComponent)
      },
      {
        path: 'results',
        loadComponent: () => import('./components/test-results/test-results.component').then(m => m.TestResultsComponent)
      },
    ]
  }
];
