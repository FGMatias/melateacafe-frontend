import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Cargo } from "../models/cargo";

@Injectable({
    providedIn: 'root'
})
export class CargoService {
    private apiUrl = 'http://localhost:8080/v1/cargo';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Cargo[]> {
        return this.http.get<Cargo[]>(this.apiUrl);
    }
}