import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaProducto, CreateCategoriaProductoDTO } from '../models/categoria-producto';

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductoService {
  private apiUrl = 'http://localhost:8080/v1/categoria';

  constructor(private http: HttpClient) { }

  getAll(): Observable<CategoriaProducto[]> {
    return this.http.get<CategoriaProducto[]>(`${this.apiUrl}`);
  }

  getById(id: number): Observable<CategoriaProducto> {
    return this.http.get<CategoriaProducto>(`${this.apiUrl}/${id}`);
  }

  create(categoria: CreateCategoriaProductoDTO): Observable<CategoriaProducto> {
    return this.http.post<CategoriaProducto>(this.apiUrl, categoria);
  }

  update(id: number, categoria: CreateCategoriaProductoDTO): Observable<CategoriaProducto> {
    return this.http.put<CategoriaProducto>(`${this.apiUrl}/${id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
