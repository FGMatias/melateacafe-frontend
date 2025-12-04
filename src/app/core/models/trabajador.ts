import { Cargo } from "./cargo";

export interface Trabajador {
  idTrabajador: number;
  cargo: Cargo;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  numeroDocumento: string;
  fechaContratacion: string;
  estado: boolean;
  fechaCreacion: string;
}