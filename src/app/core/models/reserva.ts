import { Cliente } from "./cliente";
import { Mesa } from "./mesa";

export interface Reserva {
    idReserva: number;
    mesa: Mesa;
    cliente: Cliente;
    numeroPersonas: number;
    observaciones: string;
    estado: boolean;
    fechaReserva: string;
    fechaCreacion: string;
}

export interface CreateReservaDTO {
    idMesa: number;
    idCliente: number;
    numeroPersonas: number;
    observaciones: string;
    fechaReserva: string;
}