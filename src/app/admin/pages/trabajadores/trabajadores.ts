import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { Cargo } from '../../../core/models/cargo';
import { Rol } from '../../../core/models/rol';
import { Trabajador } from '../../../core/models/trabajador';
import { CargoService } from '../../../core/services/cargo';
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
    InputIconModule,
    DatePickerModule,
    TextareaModule
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
  trabajadorForm: FormGroup;
  showTrabajadorDialog: boolean = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  cargos: Cargo[] = [];
  currentTrabajadorId: number | null = null;
  selectedCargo: Cargo | null = null;
  searchTerm: string = '';
  selectedEstado: string = '';
  selectedUsuario: string = '';

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
    private cargoService: CargoService,
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

    this.trabajadorForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],
      idCargo: [null, [Validators.required]],
      fechaContratacion: [new Date(), [Validators.required]],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.loadTrabajadores();
    this.loadRoles();
  }

  loadCargos(): void {
    this.cargoService.getAll().subscribe(data => this.cargos = data);
  }

  private patchForm(trabajador: Trabajador): void {
    this.trabajadorForm.patchValue({
      nombres: trabajador.nombres,
      apellidoPaterno: trabajador.apellidoPaterno,
      apellidoMaterno: trabajador.apellidoMaterno,
      email: trabajador.email,
      telefono: trabajador.telefono,
      numeroDocumento: trabajador.numeroDocumento,
      idCargo: trabajador.cargo.idCargo,
      fechaContratacion: new Date(trabajador.fechaContratacion),
      estado: trabajador.estado
    });
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
            command: () => this.openViewDialog(trabajador)
          },
          {
            label: 'Editar Información',
            icon: 'pi pi-pencil',
            command: () => this.openEditDialog(trabajador)
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
        this.cargos;
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

    if (this.cargos) {
      filtered = filtered.filter(t => t.cargo.nombre === this.selectedCargo?.nombre);
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

  openCreateDialog(): void {
    this.modalMode = 'create';
    this.currentTrabajadorId = null;
    this.trabajadorForm.reset({ fechaContratacion: new Date(), estado: true });
    this.trabajadorForm.enable();
    this.showTrabajadorDialog = true;
  }

  openEditDialog(trabajador: Trabajador): void {
    this.modalMode = 'edit';
    this.currentTrabajadorId = trabajador.idTrabajador;
    this.trabajadorForm.enable();
    this.patchForm(trabajador);
    this.showTrabajadorDialog = true;
  }

  openViewDialog(trabajador: Trabajador): void {
    this.modalMode = 'view';
    this.patchForm(trabajador);
    this.trabajadorForm.disable();
    this.showTrabajadorDialog = true;
  }

  saveTrabajador(): void {
    if (this.trabajadorForm.invalid) {
      this.trabajadorForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.trabajadorForm.getRawValue();

    const trabajadorDTO = {
      ...formValue,
      fechaContratacion: formValue.fechaContratacion.toISOString().split('T')[0]
    };

    const request$ = this.modalMode === 'create'
      ? this.trabajadorService.create(trabajadorDTO)
      : this.trabajadorService.update(this.currentTrabajadorId!, trabajadorDTO);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.showTrabajadorDialog = false;
        this.loadTrabajadores();
        Swal.fire('Éxito', `Trabajador ${this.modalMode === 'create' ? 'creado' : 'actualizado'} correctamente`, 'success');
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar el trabajador', 'error');
      }
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