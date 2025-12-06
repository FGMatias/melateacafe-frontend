import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoPedido } from '../models/tipo-pedido';

@Injectable({
    providedIn: 'root'
})
export class TipoPedidoService {
    private apiUrl = 'http://localhost:8080/v1/tipo-pedido';

    constructor(private http: HttpClient) { }

    getAll(): Observable<TipoPedido[]> {
        return this.http.get<TipoPedido[]>(this.apiUrl);
    }

    getById(id: number): Observable<TipoPedido> {
        return this.http.get<TipoPedido>(`${this.apiUrl}/${id}`);
    }
}