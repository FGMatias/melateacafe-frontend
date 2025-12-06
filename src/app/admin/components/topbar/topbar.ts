import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import Swal from 'sweetalert2';
import { getIniciales, getNombreCompleto, getRolNombre, Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    MenuModule,
    RippleModule
  ],
  // templateUrl: './topbar.html',
  template: `
    <header class="topbar" [class.collapsed]="collapsed">
      <div class="topbar-left">
        <button
          pButton
          pRipple
          icon="pi pi-bars"
          class="p-button-text p-button-rounded menu-toggle"
          (click)="onToggleSidebar()"
        ></button>

        <div class="page-title">
          <h2>Panel de Administración</h2>
        </div>
      </div>

      <div class="topbar-right">
        <div class="user-menu">
          <button
            pButton
            pRipple
            class="p-button-text user-button"
            (click)="menu.toggle($event)"
          >
            <p-avatar
              [label]="getInitials()"
              styleClass="avatar-small"
              shape="circle"
              [style]="{ 'background-color': '#6f4e37', 'color': '#ffffff' }"
            ></p-avatar>
            <span class="user-name">{{ getFullName() }}</span>
            <i class="pi pi-angle-down"></i>
          </button>

          <p-menu #menu [model]="userMenuItems" [popup]="true" appendTo="body"></p-menu>
        </div>
      </div>
    </header>
  `,
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: Usuario | null = null;
  userMenuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initUserMenu();
  }

  initUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.navigateToProfile()
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.navigateToSettings()
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  navigateToProfile(): void {
    this.router.navigate(['/admin/perfil']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/admin/configuracion']);
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          icon: 'success',
          title: '¡Hasta pronto!',
          text: 'Has cerrado sesión correctamente',
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
