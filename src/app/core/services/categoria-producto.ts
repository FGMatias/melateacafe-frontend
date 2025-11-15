import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaProducto } from '../models/categoria-producto';

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductoService {
  private apiUrl = 'http://localhost:8080/v1/categoria';
  
  constructor(private http: HttpClient) { }

  getCategorias(): Observable<CategoriaProducto[]> {
    return this.http.get<CategoriaProducto[]>(`${this.apiUrl}`);
  }
}
