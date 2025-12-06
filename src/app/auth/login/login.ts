import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.inicializarFormulario();
    this.cargarCredencialesGuardadas();
  }

  inicializarFormulario(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      recordarme: [false]
    });
  }

  cargarCredencialesGuardadas(): void {
    const credencialesGuardadas = localStorage.getItem('recordarCredenciales');
    if (credencialesGuardadas) {
      const { username, recordarme } = JSON.parse(credencialesGuardadas);
      this.loginForm.patchValue({
        username,
        recordarme
      });
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const { username, password, recordarme } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);

        if (recordarme) {
          localStorage.setItem('recordarCredenciales', JSON.stringify({
            username,
            recordarme: true
          }));
        } else {
          localStorage.removeItem('recordarCredenciales');
        }

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${response.usuario.trabajador?.nombres}`,
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 1500);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.loading = false;

        let mensajeError = 'Ha ocurrido un error al iniciar sesión';

        if (error?.message) {
          if (error.message.includes('Usuario no encontrado')) {
            mensajeError = 'El usuario no existe';
          } else if (error.message.includes('Usuario inactivo')) {
            mensajeError = 'Tu cuenta está desactivada. Contacta al administrador';
          }
        }

        if (error?.status === 401) {
          mensajeError = 'Usuario o contraseña incorrectos';
        } else if (error?.status === 404) {
          mensajeError = 'Usuario no encontrado';
        } else if (error?.status === 403) {
          mensajeError = 'Tu cuenta está desactivada. Contacta al administrador';
        } else if (error?.status === 0) {
          mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: mensajeError,
          confirmButtonColor: '#6f4e37'
        });
      }
    });
  }

  olvidoContrasena(): void {
    Swal.fire({
      icon: 'info',
      title: '¿Olvidaste tu contraseña?',
      text: 'Contacta al administrador del sistema para recuperar tu contraseña',
      confirmButtonColor: '#6f4e37'
    });
  }
}