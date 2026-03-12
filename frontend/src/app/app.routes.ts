import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ConfirmarCodigoComponent } from './pages/acesso/confirmar-codigo/confirmar-codigo.component';
import { RedefinirSenhaComponent } from './pages/acesso/redefinir-senha/redefinir-senha.component';

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
    path: 'signup',
    loadComponent: () => import('./pages/acesso/signup/signup.component').then(m => m.SignUpComponent)
  },
  // TODO: add real implementations for these access-related pages if needed.
  // For now, they are disabled to avoid broken lazy-load imports.
  // {
  //   path: 'verificacao-email',
  //   loadComponent: () => import('./pages/acesso/verificacao-email/verificacao-email.component').then(m => m.VerificacaoEmailComponent)
  // },
  {
    path: 'confirmar-codigo/:id',
    loadComponent: () => ConfirmarCodigoComponent
  },
  {
    path: 'redefinir-senha/:token',
    loadComponent: () => RedefinirSenhaComponent
  },
  {
    // Layout principal protegido por autenticação e papel do usuário
    path: 'app',
    loadComponent: () => import('./pages/layout-principal/layout-principal.component').then(m => m.LayoutPrincipalComponent),
    canActivate: [AuthGuard, roleGuard],
    data: { roles: ['CLIENTE', 'RESTAURANTE', 'FUNCIONARIO'] }
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
