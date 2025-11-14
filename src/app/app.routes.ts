import { Routes } from '@angular/router';

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
    // {
  //   path: 'admin',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./admin/layout/admin-layout/admin-layout').then(m => m.AdminLayout),
  //   children: [
  //     {
  //       path: 'dashboard',
  //       loadComponent: () => import('./admin/pages/dashboard/dashboard').then(m => m.Dashboard)
  //     },
  //     {
  //       path: 'productos',
  //       loadComponent: () => import('./admin/pages/productos/productos').then(m => m.Productos)
  //     },
  //     {
  //       path: 'pedidos',
  //       loadComponent: () => import('./admin/pages/pedidos/pedidos').then(m => m.Pedidos)
  //     }
  //   ]
  // },
    {
        path: '**',
        redirectTo: 'inicio'
    }
];
