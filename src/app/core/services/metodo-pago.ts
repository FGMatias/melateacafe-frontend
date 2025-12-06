import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MetodoPago } from '../models/metodo-pago';

@Injectable({
    providedIn: 'root'
})
export class MetodoPagoService {
    private apiUrl = 'http://localhost:8080/v1/metodo-pago';

    constructor(private http: HttpClient) { }

    getAll(): Observable<MetodoPago[]> {
        return this.http.get<MetodoPago[]>(this.apiUrl);
    }
}