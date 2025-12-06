import { Cliente } from "./cliente";
import { DetallePedidoRequest, DetallePedidoResponse } from "./detalle-pedido";
import { EstadoPedido } from "./estado-pedido";
import { Mesa } from "./mesa";
import { TipoPedido } from "./tipo-pedido";

export interface Pedido {
    idPedido: number;
    mesa: Mesa | null;
    cliente: Cliente;
    estadoPedido: EstadoPedido;
    tipoPedido: TipoPedido;
    subtotal: number;
    deliveryCosto: number | null;
    total: number;
    direccionEntrega: string | null;
    observaciones: string | null;
    fechaCreacion: string;
}

export interface PedidoResponse {
    idPedido: number;
    mesa?: Mesa;
    cliente: Cliente;
    estado: EstadoPedido;
    tipoPedido: TipoPedido;
    subtotal: number;
    deliveryCosto: number;
    total: number;
    direccionEntrega?: string;
    observaciones?: string;
    fechaCreacion: string;
    detalles: DetallePedidoResponse[];
}

export interface CreatePedidoRequest {
    idMesa?: number;
    idCliente: number;
    idEstado: number;
    idTipoPedido: number;
    direccionEntrega?: string;
    observaciones?: string;
    deliveryCosto?: number;
    detalles: DetallePedidoRequest[];
}

export interface UpdatePedidoRequest {
    idEstado: number;
    observaciones?: string;
}
