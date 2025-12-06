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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { Rol } from '../../../core/models/rol';
import { Trabajador } from '../../../core/models/trabajador';
import { RolService } from '../../../core/services/rol';
import { TrabajadorService } from '../../../core/services/trabajador';
import { UsuarioService } from '../../../core/services/usuario';

interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-trabajadores',
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
    InputIconModule
  ],
  templateUrl: './trabajadores.html',
  styleUrl: './trabajadores.scss',
})
export class Trabajadores implements OnInit {
  trabajadores: Trabajador[] = [];
  filteredTrabajadores: Trabajador[] = [];
  roles: Rol[] = [];
  loading: boolean = false;
  submitting: boolean = false;
  showCreateUserDialog: boolean = false;
  selectedTrabajador: Trabajador | null = null;
  userForm: FormGroup;
  menuItems: MenuItem[] = [];
  @ViewChild('actionMenu') actionMenu!: Menu;

  searchTerm: string = '';
  selectedCargo: string = '';
  selectedEstado: string = '';
  selectedUsuario: string = '';

  cargoOptions: SelectOption[] = [];
  estadoOptions: SelectOption[] = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' }
  ];
  usuarioOptions: SelectOption[] = [
    { label: 'Todos', value: '' },
    { label: 'Con Usuario', value: 'true' },
    { label: 'Sin Usuario', value: 'false' }
  ];

  constructor(
    private trabajadorService: TrabajadorService,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      idRol: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadTrabajadores();
    this.loadRoles();
  }

  toggleMenu(menu: Menu, event: any, trabajador: Trabajador) {
    this.selectedTrabajador = trabajador;

    this.menuItems = [
      {
        label: 'General',
        items: [
          {
            label: 'Ver Detalles',
            icon: 'pi pi-eye',
            command: () => this.viewDetails(trabajador)
          },
          {
            label: 'Editar Información',
            icon: 'pi pi-pencil',
            command: () => this.edit(trabajador)
          }
        ]
      },
      {
        label: 'Seguridad',
        items: [
          {
            label: 'Crear Usuario',
            icon: 'pi pi-key',
            visible: !trabajador.tieneUsuario,
            command: () => this.createUserForEmployee(trabajador)
          },
          {
            label: 'Ver Usuario',
            icon: 'pi pi-user',
            visible: !!trabajador.tieneUsuario,
            command: () => this.viewUser(trabajador)
          },
          {
            label: 'Quitar Acceso',
            icon: 'pi pi-lock-open',
            visible: !!trabajador.tieneUsuario,
            command: () => this.deleteUser(trabajador)
          }
        ]
      },
      {
        separator: true
      },
      {
        items: [
          {
            label: 'Eliminar Trabajador',
            icon: 'pi pi-trash',
            styleClass: 'menu-delete-item',
            command: () => this.deleteTrabajador(trabajador)
          }
        ]
      }
    ];

    menu.toggle(event);
  }

  loadTrabajadores(): void {
    this.loading = true;
    this.trabajadorService.getAll().subscribe({
      next: (data) => {
        this.trabajadores = data;
        this.filteredTrabajadores = data;
        this.loading = false;
        this.buildCargoOptions();
      },
      error: (error) => {
        console.error('Error cargando trabajadores:', error);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los trabajadores'
        });
      }
    });
  }

  loadRoles(): void {
    this.rolService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los roles'
        });
      }
    });
  }

  buildCargoOptions(): void {
    const cargos = [...new Set(this.trabajadores.map(t => t.cargo.nombre))];
    this.cargoOptions = [
      { label: 'Todos los cargos', value: '' },
      ...cargos.map(cargo => ({ label: cargo, value: cargo }))
    ];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.trabajadores];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        this.getFullName(t).toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.numeroDocumento.toLowerCase().includes(term) ||
        t.telefono.toLowerCase().includes(term)
      );
    }

    if (this.selectedCargo) {
      filtered = filtered.filter(t => t.cargo.nombre === this.selectedCargo);
    }

    if (this.selectedEstado !== '') {
      const estado = this.selectedEstado === 'true';
      filtered = filtered.filter(t => t.estado === estado);
    }

    if (this.selectedUsuario !== '') {
      const tieneUsuario = this.selectedUsuario === 'true';
      filtered = filtered.filter(t => t.tieneUsuario === tieneUsuario);
    }

    this.filteredTrabajadores = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCargo = '';
    this.selectedEstado = '';
    this.selectedUsuario = '';
    this.filteredTrabajadores = [...this.trabajadores];
  }

  getFullName(trabajador: Trabajador): string {
    return `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`;
  }

  getInitials(trabajador: Trabajador): string {
    return `${trabajador.nombres.charAt(0)}${trabajador.apellidoPaterno.charAt(0)}`;
  }

  viewDetails(trabajador: Trabajador): void {
    Swal.fire({
      title: this.getFullName(trabajador),
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p><strong>DNI:</strong> ${trabajador.numeroDocumento}</p>
          <p><strong>Email:</strong> ${trabajador.email}</p>
          <p><strong>Teléfono:</strong> ${trabajador.telefono}</p>
          <p><strong>Cargo:</strong> ${trabajador.cargo.nombre}</p>
          <p><strong>Estado:</strong> ${trabajador.estado ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Usuario:</strong> ${trabajador.tieneUsuario ? 'Sí' : 'No'}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#6f4e37'
    });
  }

  edit(trabajador: Trabajador): void {
    Swal.fire({
      title: 'Función en desarrollo',
      text: 'La edición de trabajadores estará disponible próximamente',
      icon: 'info',
      confirmButtonColor: '#6f4e37'
    });
  }

  openCreateDialog(): void {
    Swal.fire({
      title: 'Función en desarrollo',
      text: 'La creación de trabajadores estará disponible próximamente',
      icon: 'info',
      confirmButtonColor: '#6f4e37'
    });
  }

  createUserForEmployee(trabajador: Trabajador): void {
    this.selectedTrabajador = trabajador;
    this.userForm.patchValue({
      email: trabajador.email
    });
    this.showCreateUserDialog = true;
  }

  viewUser(trabajador: Trabajador): void {
    Swal.fire({
      title: 'Usuario del Trabajador',
      text: `Este trabajador ya tiene un usuario asociado. Puede ver los detalles en la sección de Usuarios.`,
      icon: 'info',
      confirmButtonColor: '#6f4e37',
      confirmButtonText: 'Entendido'
    });
  }

  closeCreateUserDialog(): void {
    this.showCreateUserDialog = false;
    this.selectedTrabajador = null;
    this.userForm.reset();
  }

  submitCreateUser(): void {
    if (this.userForm.invalid || !this.selectedTrabajador) {
      return;
    }

    this.submitting = true;

    const userData = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      idRol: this.userForm.value.idRol,
      idTrabajador: this.selectedTrabajador.idTrabajador
    };

    this.usuarioService.create(userData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.closeCreateUserDialog();
        Swal.fire({
          icon: 'success',
          title: '¡Usuario creado!',
          text: 'El usuario ha sido creado exitosamente',
          confirmButtonColor: '#6f4e37'
        });
        this.loadTrabajadores();
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error creando usuario:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.error || 'No se pudo crear el usuario'
        });
      }
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  deleteTrabajador(trabajador: Trabajador): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará al trabajador ${this.getFullName(trabajador)}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.trabajadorService.delete(trabajador.idTrabajador).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El trabajador ha sido eliminado.', 'success');
            this.loadTrabajadores();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el trabajador.', 'error')
        });
      }
    });
  }

  deleteUser(trabajador: Trabajador): void {
    Swal.fire({
      title: '¿Eliminar acceso?',
      text: `Se quitará el acceso al sistema para ${this.getFullName(trabajador)}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar acceso'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Info', 'Lógica de eliminación de usuario pendiente', 'info');
      }
    });
  }
}