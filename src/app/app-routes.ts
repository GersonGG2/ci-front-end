import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth0/login/login.component';
import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { AuthGuard } from './features/auth0/auth.guard';
import { UsuariosComponent } from './features/usuarios/usuarios.component';

export const Approutes: Routes = [
    { path: '', component: LoginComponent },
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
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
                loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
                data: {
                    title: 'Usuarios',
                }
            },
             {
                path: 'roles',
                loadComponent: () => import('./features/roles/roles.component').then(m => m.RolesComponent),
                data: {
                    title: 'Roles',
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
                    import('./features/authentication/authentication.module').then(
                        (m) => m.AuthenticationModule
                    ),
            },
        ],
    },
    {
        path: '**',
        redirectTo: '/authentication/404',
    },
];
