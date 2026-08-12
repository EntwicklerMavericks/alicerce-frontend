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
        loadComponent: () => import('./features/lancamentos/pages/lancamentos.page').then(m => m.LancamentosPage),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/categorias/pages/categorias.page').then(m => m.CategoriasPage),
      },
      {
        path: 'cards',
        loadComponent: () => import('./features/cartoes/pages/cartoes.page').then(m => m.CartoesPage),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/planning/pages/planning-overview.page').then(m => m.PlanningOverviewPage),
      },
      {
        path: 'goals',
        loadComponent: () => import('./features/metas/pages/metas.page').then(m => m.MetasPage),
      },
      {
        path: 'orcamentos',
        loadComponent: () => import('./features/orcamentos/pages/orcamentos.page').then(m => m.OrcamentosPage),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/produtos/pages/produtos.page').then(m => m.ProdutosPage),
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/produtos/pages/produto-detail.page').then(m => m.ProdutoDetailPage),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/wishlist/pages/wishlist.page').then(m => m.WishlistPage),
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projetos/pages/projetos.page').then(m => m.ProjetosPage),
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projetos/pages/projeto-detail.page').then(m => m.ProjetoDetailPage),
      },
      {
        path: 'planning/overview',
        loadComponent: () => import('./features/planning/pages/planning-overview.page').then(m => m.PlanningOverviewPage),
      },
      {
        path: 'planning',
        loadComponent: () => import('./features/planning/pages/timeline.page').then(m => m.TimelinePage),
      },
      {
        path: 'alertas',
        loadComponent: () => import('./features/alertas/pages/alertas.page').then(m => m.AlertasPage),
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./features/relatorios/pages/relatorios.page').then(m => m.RelatoriosPage),
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/pessoas/pages/pessoas.page').then(m => m.PessoasPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
