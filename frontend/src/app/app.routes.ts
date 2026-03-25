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
    // Layout principal protegido por autenticação e papel do usuário
    path: 'app',
    loadComponent: () => import('./pages/layout-principal/layout-principal.component').then(m => m.LayoutPrincipalComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
