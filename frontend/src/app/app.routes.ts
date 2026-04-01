import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/acesso/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'login/callback',
    loadComponent: () => import('./pages/acesso/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/acesso/signup/signup.component').then(m => m.SignUpComponent)
  },
  {
    path: 'verificacao-email',
    loadComponent: () =>
      import('./pages/acesso/verificacao-email/verificacao-email.component').then(
        m => m.VerificacaoEmailComponent,
      ),
  },
  {
    path: 'confirmar-codigo/:id',
    loadComponent: () => import('./pages/acesso/confirmar-codigo/confirmar-codigo.component').then(m => m.ConfirmarCodigoComponent)
  },
  {
    path: 'redefinir-senha/:token',
    loadComponent: () => import('./pages/acesso/redefinir-senha/redefinir-senha.component').then(m => m.RedefinirSenhaComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./pages/layout-principal/layout-principal.component').then(m => m.LayoutPrincipalComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      /** Gestão de transações — histórico completo (Módulo 1) */
      {
        path: 'transacoes',
        loadComponent: () =>
          import('./pages/historico-transacoes/historico-transacoes.component').then(m => m.HistoricoTransacoesComponent),
      },
      { path: 'historico', redirectTo: 'transacoes', pathMatch: 'full' },
      {
        path: 'favoritos',
        loadComponent: () => import('./pages/favoritos/favoritos.component').then(m => m.FavoritosComponent),
      },
      /** IA e planejamento — visão dos próximos passos (hub) */
      {
        path: 'planejamento-ia',
        loadComponent: () =>
          import('./pages/planejamento-ia-proximos-passos/planejamento-ia-proximos-passos.component').then(
            m => m.PlanejamentoIaProximosPassosComponent,
          ),
      },
      {
        path: 'importar-extratos',
        loadComponent: () =>
          import('./pages/importar-extratos/importar-extratos.component').then(m => m.ImportarExtratosComponent),
      },
      {
        path: 'simulador',
        loadComponent: () =>
          import('./pages/simulador-objetivos/simulador-objetivos.component').then(m => m.SimuladorObjetivosComponent),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./pages/chatbot-financeiro/chatbot-financeiro.component').then(m => m.ChatbotFinanceiroComponent),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
