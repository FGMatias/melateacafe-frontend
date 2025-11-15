import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import type { Producto } from '../models/producto';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  
  items$ = this.itemsSubject.asObservable();

  subtotal$ = this.items$.pipe(
    map((items) =>
      items.reduce(
        (acc, item) => acc + item.producto.precio * item.cantidad,
        0,
      ),
    ),
  );

  cantidadTotal$ = this.items$.pipe(
    map((items) =>
      items.reduce((acc, item) => acc + item.cantidad, 0),
    ),
  );

  constructor() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.itemsSubject.next(JSON.parse(carritoGuardado));
    }
  }

  agregarProducto(producto: Producto, cantidad: number): void {
    const itemsActuales = this.itemsSubject.getValue();
    const itemExistente = itemsActuales.find(
      (i) => i.producto.idProducto === producto.idProducto,
    );

    let itemsNuevos: ItemCarrito[];

    if (itemExistente) {
      itemsNuevos = itemsActuales.map((i) =>
        i.producto.idProducto === producto.idProducto
          ? { ...i, cantidad: i.cantidad + cantidad }
          : i,
      );
    } else {
      itemsNuevos = [...itemsActuales, { producto, cantidad }];
    }

    this.actualizarCarrito(itemsNuevos);
  }

  actualizarCantidad(idProducto: number, cantidad: number): void {
    const itemsActuales = this.itemsSubject.getValue();
    let itemsNuevos = itemsActuales.map((i) =>
      i.producto.idProducto === idProducto ? { ...i, cantidad } : i,
    );

    itemsNuevos = itemsNuevos.filter((i) => i.cantidad > 0);

    this.actualizarCarrito(itemsNuevos);
  }

  eliminarProducto(idProducto: number): void {
    const itemsActuales = this.itemsSubject.getValue();
    const itemsNuevos = itemsActuales.filter(
      (i) => i.producto.idProducto !== idProducto,
    );
    this.actualizarCarrito(itemsNuevos);
  }

  vaciarCarrito(): void {
    this.actualizarCarrito([]);
  }

  private actualizarCarrito(items: ItemCarrito[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem('carrito', JSON.stringify(items));
    console.log('Carrito actualizado:', items);
  }
}