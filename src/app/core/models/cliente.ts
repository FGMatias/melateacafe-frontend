import { TipoDocumento } from "./tipo-documento";

export interface Cliente {
    idCliente: number;
    tipoDocumento: TipoDocumento;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
    razonSocial: string;
    telefono: string;
    email: string;
    direccion: string;
    fechaCreation: string;
}