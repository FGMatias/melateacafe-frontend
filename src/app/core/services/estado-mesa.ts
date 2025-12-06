import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoMesa } from '../models/estado-mesa';

@Injectable({
    providedIn: 'root'
})
export class EstadoMesaService {
    private apiUrl = 'http://localhost:8080/v1/estado-mesa';

    constructor(private http: HttpClient) { }

    getAll(): Observable<EstadoMesa[]> {
        return this.http.get<EstadoMesa[]>(this.apiUrl);
    }
}