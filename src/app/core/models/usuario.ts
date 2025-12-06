import { Rol } from "./rol";
import { Trabajador } from "./trabajador";

export interface Usuario {
  idUsuario: number;
  rol: Rol;
  trabajador?: Trabajador;
  username: string;
  email: string;
  estado: boolean;
  fechaCreacion: string;
}

export interface CreateUsuarioDTO {
  idRol: number;
  idTrabajador: number;
  username: string;
  password: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  message: string;
}

export function getNombreCompleto(usuario: Usuario): string {
  if (usuario.trabajador) {
    const { nombres, apellidoPaterno, apellidoMaterno } = usuario.trabajador;
    return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
  }
  return usuario.username;
}

export function getIniciales(usuario: Usuario): string {
  if (usuario.trabajador) {
    const nombre = usuario.trabajador.nombres?.charAt(0) || '';
    const apellido = usuario.trabajador.apellidoPaterno?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  }
  return usuario.username.substring(0, 2).toUpperCase();
}

export function getRolNombre(usuario: Usuario): string {
  return usuario.rol?.nombre || 'Sin Rol';
}

export function getCargoNombre(usuario: Usuario): string {
  return usuario.trabajador?.cargo?.nombre || 'Sin Cargo';
}

