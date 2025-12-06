import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CreateTrabajadorDTO, Trabajador } from "../models/trabajador";

@Injectable({
    providedIn: 'root'
})
export class TrabajadorService {
    private apiUrl = 'http://localhost:8080/v1/trabajador';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Trabajador[]> {
        return this.http.get<Trabajador[]>(this.apiUrl);
    }

    getById(id: number): Observable<Trabajador> {
        return this.http.get<Trabajador>(`${this.apiUrl}/${id}`);
    }

    create(trabajador: CreateTrabajadorDTO): Observable<Trabajador> {
        return this.http.post<Trabajador>(this.apiUrl, trabajador);
    }

    update(id: number, trabajador: CreateTrabajadorDTO): Observable<Trabajador> {
        return this.http.put<Trabajador>(`${this.apiUrl}/${id}`, trabajador);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getWithoutUser(): Observable<Trabajador[]> {
        return this.http.get<Trabajador[]>(`${this.apiUrl}/sin-usuario`);
    }
}