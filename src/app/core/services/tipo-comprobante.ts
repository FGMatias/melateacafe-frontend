import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoComprobante } from '../models/tipo-comprobante';

@Injectable({
    providedIn: 'root'
})
export class TipoComprobanteService {
    private apiUrl = 'http://localhost:8080/v1/tipo-comprobante';

    constructor(private http: HttpClient) { }

    getAll(): Observable<TipoComprobante[]> {
        return this.http.get<TipoComprobante[]>(this.apiUrl);
    }
}