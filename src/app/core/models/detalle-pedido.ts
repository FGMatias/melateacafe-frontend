import { ProductoResponse } from "./producto";

export interface DetallePedidoResponse {
    idDetallePedido: number;
    producto: ProductoResponse;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    observaciones?: string;
}

export interface DetallePedidoRequest {
    idProducto: number;
    cantidad: number;
    observaciones?: string;
}