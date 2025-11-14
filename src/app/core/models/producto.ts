import { CategoriaProducto } from "./categoria-producto";

export interface Producto {
    idProducto: number;
    categoriaProducto: CategoriaProducto;
    nombre: string;
    descripcion: string;
    precio: number;
    imagenUrl: string;
    stockActual: number;
    stockMinimo: number;
    estado: boolean;
    fechaCreacion: string;
}