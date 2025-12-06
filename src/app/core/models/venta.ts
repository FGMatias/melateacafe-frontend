import { MetodoPago } from "./metodo-pago";
import { TipoComprobante } from "./tipo-comprobante";

export interface VentaResponse {
    idVenta: number;
    metodoPago: MetodoPago;
    tipoComprobante: TipoComprobante;
    idPedido: number;
    idUsuario: number;
    numeroComprobante: string;
    subtotal: number;
    igv: number;
    total: number;
    fecha: string;
    hora: string;
}

export interface CreateVentaRequest {
    idMetodoPago: number;
    idTipoComprobante: number;
    idPedido: number;
    idUsuario: number;
}