import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoPedido } from '../models/estado-pedido';

@Injectable({
    providedIn: 'root'
})
export class EstadoPedidoService {
    private apiUrl = 'http://localhost:8080/v1/estado-pedido';

    constructor(private http: HttpClient) { }

    getAll(): Observable<EstadoPedido[]> {
        return this.http.get<EstadoPedido[]>(this.apiUrl);
    }
}