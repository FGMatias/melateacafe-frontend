import { Rol } from "./rol";
import { Trabajador } from "./trabajador";

export interface Usuario {
  idUsuario: number;
  rol: Rol;
  trabajador?: Trabajador;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  username: string;
  email: string;
  estado: boolean;
  fechaCreacion: string;
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