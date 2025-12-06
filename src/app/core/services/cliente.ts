import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, CreateClienteRequest, UpdateClienteRequest } from '../models/cliente';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private apiUrl = 'http://localhost:8080/v1/cliente';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(this.apiUrl);
    }

    getById(id: number): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
    }

    getByEstado(estado: boolean): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.apiUrl}/estado/${estado}`);
    }

    getByNumeroDocumento(numeroDocumento: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/documento/${numeroDocumento}`);
    }

    getByEmail(email: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/email/${email}`);
    }

    buscarPorNombre(nombre: string): Observable<Cliente[]> {
        const params = new HttpParams().set('q', nombre);
        return this.http.get<Cliente[]>(`${this.apiUrl}/buscar`, { params });
    }

    getClientesConReservas(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.apiUrl}/con-reservas`);
    }

    getClientesConPedidos(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.apiUrl}/con-pedidos`);
    }

    create(request: CreateClienteRequest): Observable<Cliente> {
        return this.http.post<Cliente>(this.apiUrl, request);
    }

    update(id: number, request: UpdateClienteRequest): Observable<Cliente> {
        return this.http.put<Cliente>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}