import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProductoRequest, ProductoResponse, UpdateProductoRequest } from '../models/producto';

export interface FiltrarProductosParams {
  categoria?: number;
  precioMin?: number;
  precioMax?: number;
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/v1/producto';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.apiUrl);
  }

  getActivos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/activos`);
  }

  getById(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/${id}`);
  }

  getByCategoria(idCategoria: number): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/categoria/${idCategoria}`);
  }

  buscarPorNombre(query: string): Observable<ProductoResponse[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/buscar`, { params });
  }

  filtrarProductos(filtros: FiltrarProductosParams): Observable<ProductoResponse[]> {
    let params = new HttpParams();

    if (filtros.categoria !== undefined && filtros.categoria !== null) {
      params = params.set('categoria', filtros.categoria.toString());
    }
    if (filtros.precioMin !== undefined && filtros.precioMin !== null) {
      params = params.set('precioMin', filtros.precioMin.toString());
    }
    if (filtros.precioMax !== undefined && filtros.precioMax !== null) {
      params = params.set('precioMax', filtros.precioMax.toString());
    }
    if (filtros.nombre) {
      params = params.set('nombre', filtros.nombre);
    }

    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/filtrar`, { params });
  }

  getDestacados(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/destacados`);
  }

  getStockBajo(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/stock-bajo`);
  }

  getByEstado(estado: boolean): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/estado/${estado}`);
  }

  create(request: CreateProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.apiUrl, request);
  }

  update(id: number, request: UpdateProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}