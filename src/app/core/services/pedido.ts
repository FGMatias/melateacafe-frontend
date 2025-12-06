import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePedidoRequest, PedidoResponse, UpdatePedidoRequest } from '../models/pedido';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private apiUrl = 'http://localhost:8080/v1/pedido';

    constructor(private http: HttpClient) { }

    getAll(): Observable<PedidoResponse[]> {
        return this.http.get<PedidoResponse[]>(this.apiUrl);
    }

    getById(id: number): Observable<PedidoResponse> {
        return this.http.get<PedidoResponse>(`${this.apiUrl}/${id}`);
    }

    getByEstado(idEstado: number): Observable<PedidoResponse[]> {
        return this.http.get<PedidoResponse[]>(`${this.apiUrl}/estado/${idEstado}`);
    }

    getByTipo(idTipoPedido: number): Observable<PedidoResponse[]> {
        return this.http.get<PedidoResponse[]>(`${this.apiUrl}/tipo/${idTipoPedido}`);
    }

    getByCliente(idCliente: number): Observable<PedidoResponse[]> {
        return this.http.get<PedidoResponse[]>(`${this.apiUrl}/cliente/${idCliente}`);
    }

    getByMesa(idMesa: number): Observable<PedidoResponse[]> {
        return this.http.get<PedidoResponse[]>(`${this.apiUrl}/mesa/${idMesa}`);
    }

    create(request: CreatePedidoRequest): Observable<PedidoResponse> {
        return this.http.post<PedidoResponse>(this.apiUrl, request);
    }

    update(id: number, request: UpdatePedidoRequest): Observable<PedidoResponse> {
        return this.http.put<PedidoResponse>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    cancelar(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, {});
    }
}