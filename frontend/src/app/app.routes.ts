import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/core/login-page.component';
import { RegisterPageComponent } from './pages/core/register-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
      },
      {
        path: 'registrar',
        component: RegisterPageComponent,
      },
    ],
  },
];
