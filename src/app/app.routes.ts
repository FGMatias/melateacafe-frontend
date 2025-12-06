import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
    },
    {
        path: '',
        loadComponent: () => import('./public/layout/public-layout/public-layout').then(m => m.PublicLayout),
        children: [
            {
                path: 'inicio',
                loadComponent: () => import('./public/pages/inicio/inicio').then(m => m.Inicio)
            },
            {
                path: 'menu',
                loadComponent: () => import('./public/pages/menu/menu').then(m => m.Menu)
            }
        ]
    },
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./auth/login/login').then(m => m.Login)
            }
        ]
    },
    {
        path: 'admin',
        canActivate: [authGuard],
        loadComponent: () => import('./admin/layout/admin-layout/admin-layout').then(m => m.AdminLayout),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./admin/pages/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'trabajadores',
                loadComponent: () => import('./admin/pages/trabajadores/trabajadores').then(m => m.Trabajadores)
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./admin/pages/usuarios/usuarios').then(m => m.Usuarios)
            },
            {
                path: 'categorias',
                loadComponent: () => import('./admin/pages/categorias/categorias').then(m => m.Categorias)
            },
            {
                path: 'menu',
                loadComponent: () => import('./admin/pages/menu/menu').then(m => m.Menu)
            },
            {
                path: 'pedidos',
                loadComponent: () => import('./admin/pages/pedidos/pedidos').then(m => m.Pedidos)
            },
            {
                path: 'mesas',
                loadComponent: () => import('./admin/pages/mesas/mesas').then(m => m.Mesas)
            },
            {
                path: 'reservas',
                loadComponent: () => import('./admin/pages/reservas/reservas').then(m => m.Reservas)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'inicio'
    }
];
