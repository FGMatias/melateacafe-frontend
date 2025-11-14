import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/producto';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsCarrito: ItemCarrito[] = [];
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public carrito$: Observable<ItemCarrito[]> = this.carritoSubject.asObservable();

  constructor() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.itemsCarrito = JSON.parse(carritoGuardado);
      this.carritoSubject.next(this.itemsCarrito);
    }
  }

  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const itemExistente = this.itemsCarrito.find(
      item => item.producto.idProducto === producto.idProducto
    );

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
    } else {
      this.itemsCarrito.push({
        producto,
        cantidad,
        subtotal: cantidad * producto.precio
      });
    }

    this.actualizarCarrito();
  }

  eliminarProducto(idProducto: number): void {
    this.itemsCarrito = this.itemsCarrito.filter(
      item => item.producto.idProducto !== idProducto
    );

    this.actualizarCarrito();
  }

  actualizarCantidad(idProducto: number, cantidad: number): void {
    const item = this.itemsCarrito.find(
      item => item.producto.idProducto === idProducto
    );

    if (item) {
      if (cantidad <= 0) {
        this.eliminarProducto(idProducto);
      } else {
        item.cantidad = cantidad;
        item.subtotal = cantidad * item.producto.precio;
        this.actualizarCarrito();
      }
    }
  }

  vaciarCarrito(): void {
    this.itemsCarrito = [];
    this.actualizarCarrito();
  }

  getItems(): ItemCarrito[] {
    return this.itemsCarrito;
  }

  getCantidadTotal(): number {
    return this.itemsCarrito.reduce((total, item) => total * item.cantidad, 0);
  }

  getTotal(): number {
    return this.itemsCarrito.reduce((total, item) => total * item.subtotal, 0);
  }

  private actualizarCarrito(): void {
    this.carritoSubject.next(this.itemsCarrito);
    localStorage.setItem('carrito', JSON.stringify(this.itemsCarrito));
  }
}
