import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecoverPassword } from './pages/recover-password/recover-password';
import { Register } from './pages/register/register';
import { Principal } from './pages/principal/principal';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'recover-password', component: RecoverPassword },
  { path: 'register', component: Register },
  { path: 'principal', component: Principal}
];
