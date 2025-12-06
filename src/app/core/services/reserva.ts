import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CreateReservaDTO, Reserva } from "../models/reserva";

@Injectable({
    providedIn: 'root'
})
export class MesaService {
    private apiUrl = 'http://localhost:8080/v1/reserva';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(this.apiUrl);
    }

    getById(id: number): Observable<Reserva> {
        return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
    }

    getByEstado(estado: boolean): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(`${this.apiUrl}/estado/${estado}`);
    }

    getByFecha(fecha: string): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(`${this.apiUrl}/fecha/${fecha}`);
    }

    getByMesa(idMesa: number): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(`${this.apiUrl}/mesa/${idMesa}`);
    }

    getByCliente(idCliente: number): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(`${this.apiUrl}/cliente/${idCliente}`);
    }

    getActivas(): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(`${this.apiUrl}/activas`);
    }

    create(mesa: CreateReservaDTO): Observable<Reserva> {
        return this.http.post<Reserva>(this.apiUrl, mesa);
    }

    update(id: number, mesa: CreateReservaDTO): Observable<Reserva> {
        return this.http.put<Reserva>(`${this.apiUrl}/${id}`, mesa);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    cancelar(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, {});
    }

    confirmar(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/confirmar`, {});
    }
}