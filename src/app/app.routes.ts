import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login.page').then(m => m.LoginPage),
      },
      {
        path: 'registro',
        loadComponent: () => import('./features/auth/pages/register.page').then(m => m.RegisterPage),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard.page').then(m => m.DashboardPage),
      },
      {
        path: 'pessoas',
        loadComponent: () => import('./features/pessoas/pages/pessoas.page').then(m => m.PessoasPage),
      },
      {
        path: 'carteiras',
        loadComponent: () => import('./features/carteiras/pages/carteiras.page').then(m => m.CarteirasPage),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/carteiras/pages/carteiras.page').then(m => m.CarteirasPage),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/dashboard/pages/dashboard.page').then(m => m.DashboardPage),
      },
      {
        path: 'goals',
        loadComponent: () => import('./features/dashboard/pages/dashboard.page').then(m => m.DashboardPage),
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/pessoas/pages/pessoas.page').then(m => m.PessoasPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
