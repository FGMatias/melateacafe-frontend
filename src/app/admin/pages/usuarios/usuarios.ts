import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { Rol } from '../../../core/models/rol';
import { Trabajador } from '../../../core/models/trabajador';
import { Usuario } from '../../../core/models/usuario';
import { RolService } from '../../../core/services/rol';
import { TrabajadorService } from '../../../core/services/trabajador';
import { UsuarioService } from '../../../core/services/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    DialogModule,
    TagModule,
    AvatarModule,
    TooltipModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    ToggleSwitchModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  trabajadoresSinUsuario: Trabajador[] = [];

  allTrabajadores: Trabajador[] = [];

  loading: boolean = false;
  submitting: boolean = false;
  showDialog: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  changePasswordMode: boolean = false;

  searchValue: string = '';
  selectedRol: Rol | null = null;
  selectedEstado: any | null = null;

  estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  userForm: FormGroup;
  currentUserId: number | null = null;
  selectedUser: Usuario | null = null;
  menuItems: MenuItem[] = [];

  @ViewChild('dt') table!: Table;
  @ViewChild('menu') menu!: Menu;

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private trabajadorService: TrabajadorService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      idTrabajador: [null, [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      idRol: [null, [Validators.required]],
      password: [''],
      confirmPassword: [''],
      estado: [true]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.usuarioService.getAll().subscribe(data => {
      this.usuarios = data;
      this.loading = false;
    });

    this.rolService.getAll().subscribe(data => this.roles = data);

    this.trabajadorService.getAll().subscribe(data => {
      this.allTrabajadores = data;
      this.trabajadoresSinUsuario = data.filter(t => !t.tieneUsuario);
    });
  }

  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.table) this.table.filterGlobal(input.value, 'contains');
  }

  filterByRol(): void {
    if (this.table) {
      const valor = this.selectedRol ? this.selectedRol.nombre : null;
      this.table.filter(valor, 'rol.nombre', 'equals');
    }
  }

  filterByEstado(): void {
    if (this.table) {
      const valor = this.selectedEstado ? this.selectedEstado.value : null;
      this.table.filter(valor, 'estado', 'equals');
    }
  }

  clearFilters(): void {
    if (this.table) this.table.clear();
    this.searchValue = '';
    this.selectedRol = null;
    this.selectedEstado = null;
  }

  openCreateDialog(): void {
    this.modalMode = 'create';
    this.changePasswordMode = true;
    this.currentUserId = null;

    this.trabajadorService.getAll().subscribe(data => {
      this.trabajadoresSinUsuario = data.filter(t => !t.tieneUsuario);
    });

    this.userForm.reset({ estado: true });
    this.userForm.get('idTrabajador')?.enable();
    this.updatePasswordValidators();
    this.showDialog = true;
  }

  openEditDialog(usuario: Usuario): void {
    this.modalMode = 'edit';
    this.changePasswordMode = false;
    this.currentUserId = usuario.idUsuario;

    this.userForm.patchValue({
      idTrabajador: usuario.trabajador?.idTrabajador,
      username: usuario.username,
      email: usuario.email,
      idRol: usuario.rol.idRol,
      estado: usuario.estado,
      password: '',
      confirmPassword: ''
    });

    this.userForm.get('idTrabajador')?.disable();
    this.updatePasswordValidators();
    this.showDialog = true;
  }

  updatePasswordValidators() {
    const passwordControl = this.userForm.get('password');
    const confirmControl = this.userForm.get('confirmPassword');

    if (this.changePasswordMode) {
      passwordControl?.setValidators([Validators.required, Validators.minLength(8)]);
      confirmControl?.setValidators([Validators.required]);
    } else {
      passwordControl?.clearValidators();
      confirmControl?.clearValidators();
    }
    passwordControl?.updateValueAndValidity();
    confirmControl?.updateValueAndValidity();
  }

  togglePasswordEdit() {
    this.updatePasswordValidators();
  }

  saveUsuario(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.userForm.getRawValue();

    const usuarioDTO: any = {
      idTrabajador: formValue.idTrabajador,
      username: formValue.username,
      email: formValue.email,
      idRol: formValue.idRol,
      estado: formValue.estado
    };

    if (this.changePasswordMode && formValue.password) {
      usuarioDTO.password = formValue.password;
    }

    const request$ = this.modalMode === 'create'
      ? this.usuarioService.create(usuarioDTO)
      : this.usuarioService.update(this.currentUserId!, usuarioDTO);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.showDialog = false;
        this.loadData();
        Swal.fire('Éxito', `Usuario ${this.modalMode === 'create' ? 'creado' : 'actualizado'} correctamente`, 'success');
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        Swal.fire('Error', err.error?.message || 'No se pudo guardar el usuario', 'error');
      }
    });
  }

  deleteUsuario(usuario: Usuario): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Estás a punto de eliminar el acceso de ${usuario.username}. Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6f4e37',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.delete(usuario.idUsuario).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!pass) return null;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  toggleMenu(menu: Menu, event: any, usuario: Usuario) {
    this.selectedUser = usuario;
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => this.openEditDialog(usuario)
          },
          {
            label: 'Eliminar',
            icon: 'pi pi-trash',
            styleClass: 'text-red-500',
            command: () => this.deleteUsuario(usuario)
          }
        ]
      }
    ];
    menu.toggle(event);
  }

  toTitleCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}