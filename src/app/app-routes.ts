import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { UsuariosComponent } from './features/usuarios/usuario/usuarios.component';
import { AuthGuard } from './features/authentication/auth.guard';
import { LoginComponent } from './features/authentication/login/login.component';

export const Approutes: Routes = [
  { path: '', redirectTo: '/authentication/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/periodo', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/pages/main-page/notifications.component').then(m => m.NotificationsComponent),
        data: {
          title: 'Notificaciones',
        }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuario/usuarios.component').then(m => m.UsuariosComponent),
        data: {
          title: 'Usuarios',
        }
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/roles/roles.component').then(m => m.RolesComponent),
        data: {
          title: 'Roles',
        }
      },
      {
        path: 'academias',
        loadComponent: () => import('./features/academias/academias/academias.component').then(m => m.AcademiasComponent),
        data: {
          title: 'Academias',
        }
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/cursos/cursos/cursos.component').then(m => m.CursosComponent),
        data: {
          title: 'Cursos',
        }
      },
      {
        path: 'periodo',
        loadChildren: () => import('./features/periodo/periodo.module').then(m => m.PeriodoModule),
        data: {
          title: 'Periodo',
        }
      }

    ],
  },
{
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./features/authentication/authetification.module').then(
            (m) => m.AuthenticationModule
          )
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
