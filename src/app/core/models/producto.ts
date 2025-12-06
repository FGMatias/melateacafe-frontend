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

export interface ProductoResponse {
    idProducto: number;
    categoriaProducto: CategoriaProducto;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagenUrl?: string;
    stockActual: number;
    stockMinimo: number;
    estado: boolean;
}

export interface CreateProductoRequest {
    idCategoriaProducto: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagenUrl?: string;
    estado?: boolean;
}

export interface UpdateProductoRequest {
    idCategoriaProducto: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagenUrl?: string;
    estado?: boolean;
}