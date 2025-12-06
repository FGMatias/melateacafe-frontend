import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { EstadoMesa } from "../models/estado-mesa";
import { CreateMesaDTO, Mesa } from "../models/mesa";

@Injectable({
    providedIn: 'root'
})
export class MesaService {
    private apiUrl = 'http://localhost:8080/v1/mesa';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Mesa[]> {
        return this.http.get<Mesa[]>(this.apiUrl);
    }

    getById(id: number): Observable<Mesa> {
        return this.http.get<Mesa>(`${this.apiUrl}/${id}`);
    }

    getByEstado(estado: boolean): Observable<Mesa[]> {
        return this.http.get<Mesa[]>(`${this.apiUrl}/estado/${estado}`);
    }

    getByEstadoMesa(idEstadoMesa: EstadoMesa): Observable<Mesa[]> {
        return this.http.get<Mesa[]>(`${this.apiUrl}/estado-mesa/${idEstadoMesa}`);
    }

    getByCapacidad(capacidad: number): Observable<Mesa[]> {
        return this.http.get<Mesa[]>(`${this.apiUrl}/capacidad/${capacidad}`);
    }

    getDisponibles(): Observable<Mesa[]> {
        return this.http.get<Mesa[]>(`${this.apiUrl}/disponibles`);
    }

    create(mesa: CreateMesaDTO): Observable<Mesa> {
        return this.http.post<Mesa>(this.apiUrl, mesa);
    }

    update(id: number, mesa: CreateMesaDTO): Observable<Mesa> {
        return this.http.put<Mesa>(`${this.apiUrl}/${id}`, mesa);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}