import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoDocumento } from '../models/tipo-documento';

@Injectable({
    providedIn: 'root'
})
export class TipoDocumentoService {
    private apiUrl = 'http://localhost:8080/v1/tipo-documento';

    constructor(private http: HttpClient) { }

    getAll(): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(this.apiUrl);
    }

}