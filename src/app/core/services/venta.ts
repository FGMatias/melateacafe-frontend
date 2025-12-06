import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateVentaRequest, VentaResponse } from '../models/venta';

@Injectable({
    providedIn: 'root'
})
export class VentaService {
    private apiUrl = 'http://localhost:8080/v1/venta';

    constructor(private http: HttpClient) { }

    getAll(): Observable<VentaResponse[]> {
        return this.http.get<VentaResponse[]>(this.apiUrl);
    }

    getById(id: number): Observable<VentaResponse> {
        return this.http.get<VentaResponse>(`${this.apiUrl}/${id}`);
    }

    getByFecha(fecha: string): Observable<VentaResponse[]> {
        return this.http.get<VentaResponse[]>(`${this.apiUrl}/fecha/${fecha}`);
    }

    getByFechaRango(inicio: string, fin: string): Observable<VentaResponse[]> {
        const params = new HttpParams()
            .set('inicio', inicio)
            .set('fin', fin);
        return this.http.get<VentaResponse[]>(`${this.apiUrl}/fecha-rango`, { params });
    }

    getByMetodoPago(idMetodoPago: number): Observable<VentaResponse[]> {
        return this.http.get<VentaResponse[]>(`${this.apiUrl}/metodo-pago/${idMetodoPago}`);
    }

    getByTipoComprobante(idTipoComprobante: number): Observable<VentaResponse[]> {
        return this.http.get<VentaResponse[]>(`${this.apiUrl}/tipo-comprobante/${idTipoComprobante}`);
    }

    getByNumeroComprobante(numeroComprobante: string): Observable<VentaResponse> {
        return this.http.get<VentaResponse>(`${this.apiUrl}/comprobante/${numeroComprobante}`);
    }

    getTotalByFecha(fecha: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/total/fecha/${fecha}`);
    }

    getTotalByFechaRango(inicio: string, fin: string): Observable<number> {
        const params = new HttpParams()
            .set('inicio', inicio)
            .set('fin', fin);
        return this.http.get<number>(`${this.apiUrl}/total/fecha-rango`, { params });
    }

    create(request: CreateVentaRequest): Observable<VentaResponse> {
        return this.http.post<VentaResponse>(this.apiUrl, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}