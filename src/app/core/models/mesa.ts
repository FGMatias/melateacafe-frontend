import { EstadoMesa } from "./estado-mesa";

export interface Mesa {
    idMesa: number;
    estadoMesa: EstadoMesa;
    numero: string;
    capacidad: number;
    estado: boolean;
}

export interface CreateMesaDTO {
    idEstado: number;
    numero: string;
    capacidad: number;
}