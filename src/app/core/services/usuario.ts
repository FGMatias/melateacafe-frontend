import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CreateUsuarioDTO, Usuario } from "../models/usuario";

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private apiUrl = 'http://localhost:8080/v1/usuario';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.apiUrl);
    }

    getById(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
    }

    create(usuario: CreateUsuarioDTO): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, usuario);
    }

    update(id: number, usuario: CreateUsuarioDTO): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}