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
      
      /* Pilar 1: Início */
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard.page').then(m => m.DashboardPage),
      },

      /* Pilar 2: Finanças (Hub Operacional com Sub-abas) */
      {
        path: 'financas',
        loadComponent: () => import('./features/financas/pages/financas-container.page').then(m => m.FinancasContainerPage),
        children: [
          { path: '', redirectTo: 'transacoes', pathMatch: 'full' },
          {
            path: 'transacoes',
            loadComponent: () => import('./features/lancamentos/pages/lancamentos.page').then(m => m.LancamentosPage),
          },
          {
            path: 'cartoes',
            loadComponent: () => import('./features/cartoes/pages/cartoes.page').then(m => m.CartoesPage),
          },
          {
            path: 'carteiras',
            loadComponent: () => import('./features/carteiras/pages/carteiras.page').then(m => m.CarteirasPage),
          },
        ],
      },

      /* Pilar 3: Futuro (Hub de Planejamento Prospectivo com Sub-abas) */
      {
        path: 'futuro',
        loadComponent: () => import('./features/futuro/pages/futuro-container.page').then(m => m.FuturoContainerPage),
        children: [
          { path: '', redirectTo: 'planning', pathMatch: 'full' },
          {
            path: 'planning',
            loadComponent: () => import('./features/planning/pages/timeline.page').then(m => m.TimelinePage),
          },
          {
            path: 'planning/overview',
            loadComponent: () => import('./features/planning/pages/planning-overview.page').then(m => m.PlanningOverviewPage),
          },
          {
            path: 'metas',
            loadComponent: () => import('./features/metas/pages/metas.page').then(m => m.MetasPage),
          },
          {
            path: 'wishlist',
            loadComponent: () => import('./features/wishlist/pages/wishlist.page').then(m => m.WishlistPage),
          },
          {
            path: 'projetos',
            loadComponent: () => import('./features/projetos/pages/projetos.page').then(m => m.ProjetosPage),
          },
          {
            path: 'projetos/:id',
            loadComponent: () => import('./features/projetos/pages/projeto-detail.page').then(m => m.ProjetoDetailPage),
          },
          {
            path: 'orcamentos',
            loadComponent: () => import('./features/orcamentos/pages/orcamentos.page').then(m => m.OrcamentosPage),
          },
        ],
      },

      /* Pilar 4: Mais (Hub Estrutural & Ajustes) */
      {
        path: 'mais',
        loadComponent: () => import('./features/mais/pages/mais-hub.page').then(m => m.MaisHubPage),
      },

      /* Módulos Estruturais e Detalhes */
      {
        path: 'categorias',
        loadComponent: () => import('./features/categorias/pages/categorias.page').then(m => m.CategoriasPage),
      },
      {
        path: 'pessoas',
        loadComponent: () => import('./features/pessoas/pages/pessoas.page').then(m => m.PessoasPage),
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
        path: 'alertas',
        loadComponent: () => import('./features/alertas/pages/alertas.page').then(m => m.AlertasPage),
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./features/relatorios/pages/relatorios.page').then(m => m.RelatoriosPage),
      },

      /* Redirecionamentos de Compatibilidade para Preservar Bookmarks Legados */
      { path: 'transactions', redirectTo: 'financas/transacoes', pathMatch: 'full' },
      { path: 'cards', redirectTo: 'financas/cartoes', pathMatch: 'full' },
      { path: 'carteiras', redirectTo: 'financas/carteiras', pathMatch: 'full' },
      { path: 'calendar', redirectTo: 'futuro/planning', pathMatch: 'full' },
      { path: 'planning', redirectTo: 'futuro/planning', pathMatch: 'full' },
      { path: 'planning/overview', redirectTo: 'futuro/planning/overview', pathMatch: 'full' },
      { path: 'goals', redirectTo: 'futuro/metas', pathMatch: 'full' },
      { path: 'wishlist', redirectTo: 'futuro/wishlist', pathMatch: 'full' },
      { path: 'projects', redirectTo: 'futuro/projetos', pathMatch: 'full' },
      { path: 'projects/:id', redirectTo: 'futuro/projetos/:id', pathMatch: 'full' },
      { path: 'orcamentos', redirectTo: 'futuro/orcamentos', pathMatch: 'full' },
      { path: 'menu', redirectTo: 'mais', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
