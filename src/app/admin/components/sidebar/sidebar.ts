import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { Usuario, getIniciales, getNombreCompleto, getRolNombre } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
    TooltipModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  currentUser: Usuario | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initMenu();
  }

  initMenu(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/admin/dashboard'
      },
      {
        label: 'Trabajadores',
        icon: 'pi pi-id-card',
        route: '/admin/trabajadores',
        roles: ['Administrador']
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-users',
        route: '/admin/usuarios',
        roles: ['Administrador']
      },
      {
        label: 'Menú/Carta',
        icon: 'pi pi-book',
        route: '/admin/menu'
      },
      {
        label: 'Categorías',
        icon: 'pi pi-tags',
        route: '/admin/categorias'
      },
      {
        label: 'Pedidos',
        icon: 'pi pi-shopping-cart',
        route: '/admin/pedidos',
        badge: 5
      },
      {
        label: 'Mesas',
        icon: 'pi pi-th-large',
        route: '/admin/mesas'
      },
      {
        label: 'Reservas',
        icon: 'pi pi-calendar',
        route: '/admin/reservas',
        badge: 3
      }
    ];
  }

  hasAccess(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    const userRole = this.currentUser?.rol?.nombre;
    return item.roles.includes(userRole || '');
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  navigateToProfile(): void {
    this.router.navigate(['/admin/perfil']);
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6f4e37',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((res) => {
      if (res.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          icon: 'success',
          title: '¡Hasta pronto!',
          text: 'Cerraste sesión correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';

    return getIniciales(this.currentUser);
  }

  getFullName(): string {
    if (!this.currentUser) return 'Usuario';
    return getNombreCompleto(this.currentUser);
  }

  getRoleName(): string {
    return getRolNombre(this.currentUser!);
  }
}
