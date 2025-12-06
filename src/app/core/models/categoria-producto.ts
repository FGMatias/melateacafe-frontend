export interface CategoriaProducto {
    idCategoriaProducto: number;
    nombre: string;
    descripcion: string;
    estado: boolean;
}

export interface CreateCategoriaProductoDTO {
    nombre: string;
    descripcion: string;
}