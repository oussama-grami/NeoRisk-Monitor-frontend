import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'prediction',
    loadComponent: () => import('./components/prediction/prediction').then(m => m.Prediction)
  },
  {
    path: 'comparison',
    loadComponent: () => import('./components/comparison/comparison').then(m => m.Comparison)
  },
  {
    path: 'history',
    loadComponent: () => import('./components/history/history').then(m => m.History)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin').then(m => m.Admin)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
