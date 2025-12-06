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
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { Cargo } from '../../../core/models/cargo';
import { Rol } from '../../../core/models/rol';
import { Trabajador } from '../../../core/models/trabajador';
import { Usuario } from '../../../core/models/usuario';
import { CargoService } from '../../../core/services/cargo';
import { RolService } from '../../../core/services/rol';
import { TrabajadorService } from '../../../core/services/trabajador';
import { UsuarioService } from '../../../core/services/usuario';

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
    DatePickerModule
  ],
  templateUrl: './trabajadores.html',
  styleUrl: './trabajadores.scss',
})
export class Trabajadores implements OnInit {
  trabajadores: Trabajador[] = [];
  cargos: Cargo[] = [];
  roles: Rol[] = [];

  loading: boolean = false;
  submitting: boolean = false;

  searchValue: string = '';

  showTrabajadorDialog: boolean = false;
  showCreateUserDialog: boolean = false;
  showUserDialog: boolean = false;

  modalMode: 'create' | 'edit' | 'view' = 'create';

  trabajadorForm: FormGroup;
  userForm: FormGroup;

  selectedTrabajador: Trabajador | null = null;
  currentTrabajadorId: number | null = null;
  selectedUser: Usuario | null = null;
  selectedCargo: Cargo | null = null;

  menuItems: MenuItem[] = [];
  @ViewChild('actionMenu') actionMenu!: Menu;
  @ViewChild('dt') table!: Table;

  constructor(
    private trabajadorService: TrabajadorService,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private cargoService: CargoService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      idRol: [null, [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.trabajadorForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      apellidoMaterno: ['', [Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      numeroDocumento: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      idCargo: [null, [Validators.required]],
      fechaContratacion: [new Date(), [Validators.required]],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.loadTrabajadores();
    this.loadRoles();
    this.loadCargos();
  }

  loadTrabajadores(): void {
    this.loading = true;
    this.trabajadorService.getAll().subscribe({
      next: (data) => {
        console.log('Trabajadores cargados:', data);
        this.trabajadores = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando trabajadores:', error);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los trabajadores',
          confirmButtonColor: '#6f4e37'
        });
      }
    });
  }

  loadRoles(): void {
    this.rolService.getAll().subscribe({
      next: (data) => {
        console.log('Roles cargados:', data);
        this.roles = data;
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
      }
    });
  }

  loadCargos(): void {
    this.cargoService.getAll().subscribe({
      next: (data) => {
        console.log('Cargos cargados:', data);
        this.cargos = data;
      },
      error: (error) => {
        console.error('Error cargando cargos:', error);
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.table) {
      this.table.filterGlobal(input.value, 'contains');
    }
  }

  clearFilters(): void {
    if (this.table) {
      this.table.clear();
    }

    this.searchValue = '';
    this.selectedCargo = null;
  }

  filterByCargo(): void {
    if (this.table) {
      const valorFiltro = this.selectedCargo ? this.selectedCargo.nombre : null;

      this.table.filter(valorFiltro, 'cargo.nombre', 'equals');
    }
  }

  getFullName(trabajador: Trabajador): string {
    return `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno || ''}`.trim();
  }

  getInitials(trabajador: Trabajador): string {
    return `${trabajador.nombres.charAt(0)}${trabajador.apellidoPaterno.charAt(0)}`.toUpperCase();
  }

  private generateUsername(trabajador: Trabajador): string {
    const primeraLetraNombre = trabajador.nombres.charAt(0).toLowerCase();
    const apellido = trabajador.apellidoPaterno.toLowerCase().replace(/\s+/g, '');
    return `${primeraLetraNombre}${apellido}`;
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  openCreateDialog(): void {
    this.modalMode = 'create';
    this.currentTrabajadorId = null;
    this.trabajadorForm.reset({
      fechaContratacion: new Date(),
      estado: true
    });
    this.showTrabajadorDialog = true;
  }

  openViewDialog(trabajador: Trabajador): void {
    this.modalMode = 'view';
    this.currentTrabajadorId = trabajador.idTrabajador;
    this.patchTrabajadorForm(trabajador);
    this.trabajadorForm.disable();
    this.showTrabajadorDialog = true;
  }

  openEditDialog(trabajador: Trabajador): void {
    this.modalMode = 'edit';
    this.currentTrabajadorId = trabajador.idTrabajador;

    this.patchTrabajadorForm(trabajador);
    this.trabajadorForm.enable();

    this.showTrabajadorDialog = true;
  }

  private patchTrabajadorForm(trabajador: Trabajador): void {
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

  saveTrabajador(): void {
    console.log('Estado del formulario:', {
      valid: this.trabajadorForm.valid,
      invalid: this.trabajadorForm.invalid,
      errors: this.getFormErrors(),
      values: this.trabajadorForm.value
    });

    if (this.trabajadorForm.invalid) {
      this.trabajadorForm.markAllAsTouched();

      const errorFields = this.getInvalidFields();
      console.error('Campos inválidos:', errorFields);

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        html: `Por favor completa correctamente los siguientes campos:<br><br><strong>${errorFields.join('<br>')}</strong>`,
        confirmButtonColor: '#6f4e37'
      });
      return;
    }

    this.submitting = true;
    const formValue = this.trabajadorForm.getRawValue();

    const trabajadorDTO = {
      ...formValue,
      fechaContratacion: this.formatDateForBackend(formValue.fechaContratacion)
    };

    console.log('Enviando al backend:', trabajadorDTO);

    const request$ = this.modalMode === 'create'
      ? this.trabajadorService.create(trabajadorDTO)
      : this.trabajadorService.update(this.currentTrabajadorId!, trabajadorDTO);

    request$.subscribe({
      next: (response) => {
        console.log('Trabajador guardado:', response);
        this.submitting = false;
        this.showTrabajadorDialog = false;
        this.loadTrabajadores();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `Trabajador ${this.modalMode === 'create' ? 'creado' : 'actualizado'} correctamente`,
          confirmButtonColor: '#6f4e37',
          timer: 2000,
          timerProgressBar: true
        });
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error guardando trabajador:', error);

        let errorMessage = 'No se pudo guardar el trabajador';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error) {
          errorMessage = typeof error.error === 'string' ? error.error : errorMessage;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#6f4e37'
        });
      }
    });
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.trabajadorForm.controls).forEach(key => {
      const control = this.trabajadorForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private getInvalidFields(): string[] {
    const invalidFields: string[] = [];
    const fieldNames: { [key: string]: string } = {
      nombres: 'Nombres',
      apellidoPaterno: 'Apellido Paterno',
      apellidoMaterno: 'Apellido Materno',
      email: 'Email',
      telefono: 'Teléfono',
      numeroDocumento: 'DNI',
      idCargo: 'Cargo',
      fechaContratacion: 'Fecha de Contratación',
      estado: 'Estado'
    };

    Object.keys(this.trabajadorForm.controls).forEach(key => {
      const control = this.trabajadorForm.get(key);
      if (control && control.invalid) {
        invalidFields.push(fieldNames[key] || key);
      }
    });

    return invalidFields;
  }

  private formatDateForBackend(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  deleteTrabajador(trabajador: Trabajador): void {
    if (trabajador.tieneUsuario) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede eliminar',
        text: 'Este trabajador tiene un usuario asociado. Primero debes eliminar su usuario.',
        confirmButtonColor: '#6f4e37'
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      html: `Se eliminará al trabajador:<br><strong>${this.getFullName(trabajador)}</strong><br><br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6f4e37',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.trabajadorService.delete(trabajador.idTrabajador).subscribe({
          next: () => {
            console.log('Trabajador eliminado');
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El trabajador ha sido eliminado correctamente',
              confirmButtonColor: '#6f4e37',
              timer: 2000,
              timerProgressBar: true
            });
            this.loadTrabajadores();
          },
          error: (error) => {
            console.error('Error eliminando trabajador:', error);
            let errorMessage = 'No se pudo eliminar el trabajador';
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
              confirmButtonColor: '#6f4e37'
            });
          }
        });
      }
    });
  }

  createUserForEmployee(trabajador: Trabajador): void {
    this.selectedTrabajador = trabajador;
    this.userForm.reset();
    this.userForm.patchValue({
      email: trabajador.email,
      username: this.generateUsername(trabajador)
    });
    this.showCreateUserDialog = true;
  }

  submitCreateUser(): void {
    if (this.userForm.invalid || !this.selectedTrabajador) {
      this.userForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos correctamente',
        confirmButtonColor: '#6f4e37'
      });
      return;
    }

    if (this.userForm.hasError('passwordMismatch')) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor verifica que las contraseñas sean iguales',
        confirmButtonColor: '#6f4e37'
      });
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
        console.log('Usuario creado:', response);
        this.submitting = false;
        this.closeCreateUserDialog();

        Swal.fire({
          icon: 'success',
          title: '¡Usuario creado!',
          text: 'El usuario ha sido creado exitosamente',
          confirmButtonColor: '#6f4e37',
          timer: 2000,
          timerProgressBar: true
        });

        this.loadTrabajadores();
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error creando usuario:', error);

        let errorMessage = 'No se pudo crear el usuario';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error) {
          errorMessage = typeof error.error === 'string' ? error.error : errorMessage;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#6f4e37'
        });
      }
    });
  }

  closeCreateUserDialog(): void {
    this.showCreateUserDialog = false;
    this.selectedTrabajador = null;
    this.userForm.reset();
  }

  viewUser(trabajador: Trabajador): void {
    this.usuarioService.getAll().subscribe({
      next: (usuarios) => {
        const usuario = usuarios.find(u => u.trabajador?.idTrabajador === trabajador.idTrabajador);

        if (usuario) {
          this.selectedUser = usuario;
          this.selectedTrabajador = trabajador;
          this.showUserDialog = true;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Usuario no encontrado',
            text: 'No se pudo encontrar el usuario asociado',
            confirmButtonColor: '#6f4e37'
          });
        }
      },
      error: (error) => {
        console.error('Error buscando usuario:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener la información del usuario',
          confirmButtonColor: '#6f4e37'
        });
      }
    });
  }

  deleteUser(trabajador: Trabajador): void {
    Swal.fire({
      title: '¿Quitar acceso al sistema?',
      html: `Se eliminará el usuario de:<br><strong>${this.getFullName(trabajador)}</strong><br><br>El trabajador seguirá existiendo pero sin acceso al sistema.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6f4e37',
      confirmButtonText: 'Sí, quitar acceso',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.getAll().subscribe({
          next: (usuarios) => {
            const usuario = usuarios.find(u => u.trabajador?.idTrabajador === trabajador.idTrabajador);

            if (usuario) {
              this.usuarioService.delete(usuario.idUsuario).subscribe({
                next: () => {
                  console.log('Usuario eliminado');
                  Swal.fire({
                    icon: 'success',
                    title: 'Acceso eliminado',
                    text: 'El usuario ha sido eliminado correctamente',
                    confirmButtonColor: '#6f4e37',
                    timer: 2000,
                    timerProgressBar: true
                  });
                  this.loadTrabajadores();
                },
                error: (error) => {
                  console.error('Error eliminando usuario:', error);
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el usuario',
                    confirmButtonColor: '#6f4e37'
                  });
                }
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Usuario no encontrado',
                text: 'No se encontró el usuario asociado a este trabajador',
                confirmButtonColor: '#6f4e37'
              });
            }
          },
          error: (error) => {
            console.error('Error buscando usuario:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo obtener la información del usuario',
              confirmButtonColor: '#6f4e37'
            });
          }
        });
      }
    });
  }

  toggleMenu(menu: Menu, event: any, trabajador: Trabajador): void {
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
        label: 'Acceso al Sistema',
        items: [
          {
            label: 'Crear Usuario',
            icon: 'pi pi-user-plus',
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
            icon: 'pi pi-lock',
            visible: !!trabajador.tieneUsuario,
            command: () => this.deleteUser(trabajador)
          }
        ].filter(item => item.visible !== false)
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
}