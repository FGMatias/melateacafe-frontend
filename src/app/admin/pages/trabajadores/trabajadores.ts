import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
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

@Component({
  selector: 'app-trabajadores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    DialogModule,
    TagModule,
    AvatarModule,
    TooltipModule
  ],
  templateUrl: './trabajadores.html',
  styleUrl: './trabajadores.scss',
})
export class Trabajadores implements OnInit {
  trabajadores: Trabajador[] = [];
  roles: Rol[] = [];
  loading: boolean = false;
  submitting: boolean = false;
  showCreateUserDialog: boolean = false;
  selectedTrabajador: Trabajador | null = null;
  userForm: FormGroup;

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
    })
  }

  ngOnInit(): void {
    this.loadTrabajadores();
    this.loadRoles();
  }

  loadTrabajadores(): void {
    this.loading = true;
    this.trabajadorService.getAll().subscribe({
      next: (data) => {
        this.trabajadores = data;
        this.loading = false;
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
      }
    });
  }

  createUserForEmployee(trabajador: Trabajador): void {
    this.selectedTrabajador = trabajador;

    this.userForm.patchValue({
      username: this.generateUsername(trabajador),
      email: trabajador.email
    });

    this.showCreateUserDialog = true;
  }

  generateUsername(trabajador: Trabajador): string {
    const nombre = trabajador.nombres.charAt(0).toLowerCase();
    const apellido = trabajador.apellidoPaterno.toLowerCase();
    return `${nombre}${apellido}`;
  }

  submitCreateUser(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.selectedTrabajador) {
      return;
    }

    this.submitting = true;

    const userData = {
      idTrabajador: this.selectedTrabajador.idTrabajador,
      idRol: this.userForm.value.idRol,
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      estado: true
    };

    this.usuarioService.create(userData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.showCreateUserDialog = false;

        Swal.fire({
          icon: 'success',
          title: '¡Usuario Creado!',
          text: `Usuario creado exitosamente para ${this.getFullName(this.selectedTrabajador)}`,
          timer: 2000
        });

        this.loadTrabajadores();
        this.userForm.reset();
        this.selectedTrabajador = null;
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error creando usuario:', error);

        let errorMessage = 'No se pudo crear el usuario';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage
        });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  openCreateDialog(): void {
    Swal.fire({
      icon: 'info',
      title: 'Crear Trabajador',
      text: 'Redirigiendo al formulario de creación de trabajador...'
    });
  }

  viewDetails(trabajador: Trabajador): void {
    Swal.fire({
      title: 'Detalles del Trabajador',
      html: `
        <div class="text-left">
          <p><strong>Nombre:</strong> ${this.getFullName(trabajador)}</p>
          <p><strong>Email:</strong> ${trabajador.email}</p>
          <p><strong>Teléfono:</strong> ${trabajador.telefono}</p>
          <p><strong>DNI:</strong> ${trabajador.numeroDocumento}</p>
          <p><strong>Cargo:</strong> ${trabajador.cargo.nombre}</p>
          <p><strong>Fecha de Contratación:</strong> ${trabajador.fechaContratacion}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  edit(trabajador: Trabajador): void {
    Swal.fire({
      icon: 'info',
      title: 'Editar Trabajador',
      text: 'Función en desarrollo...'
    });
  }

  viewUser(trabajador: Trabajador): void {
    Swal.fire({
      icon: 'info',
      title: 'Ver Usuario',
      text: 'Redirigiendo a la vista de usuario...'
    });
  }

  getFullName(trabajador: Trabajador | null): string {
    if (!trabajador) return '';
    return `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno || ''}`.trim();
  }

  getInitials(trabajador: Trabajador | null): string {
    if (!trabajador) return 'T';
    const nombre = trabajador.nombres?.charAt(0) || '';
    const apellido = trabajador.apellidoPaterno?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  }
}
