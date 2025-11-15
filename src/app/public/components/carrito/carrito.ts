import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { CarritoService } from '../../../core/services/carrito';

@Component({
  selector: 'app-carrito',
  imports: [
    CommonModule,
    DrawerModule,
    ButtonModule,
    RouterLink,
    DecimalPipe
  ],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class CarritoComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  constructor(public carritoService: CarritoService) { }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  eliminarProducto(id: number): void {
    this.carritoService.eliminarProducto(id);
  }

  aumentarCantidad(id: number, cantidadActual: number): void {
    this.carritoService.actualizarCantidad(id, cantidadActual + 1);
  }

  disminuirCantidad(id: number, cantidadActual: number): void {
    this.carritoService.actualizarCantidad(id, cantidadActual - 1);
  }

  vaciarCarrito(): void {
    this.carritoService.vaciarCarrito();
  }
}
