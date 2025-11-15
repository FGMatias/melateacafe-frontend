import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Subscription } from 'rxjs';
import { CarritoService } from '../../../core/services/carrito';
import { CarritoComponent } from '../../components/carrito/carrito';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    CommonModule,
    DrawerModule,
    CarritoComponent
  ],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout implements OnInit, OnDestroy {
  menuOpen = false;
  isScrolled = false;
  carritoVisible = false;
  cantidadCarrito = 0;

  private carritoSub?: Subscription;

  constructor(private carritoService: CarritoService) { }

  ngOnInit(): void {
    this.carritoSub = this.carritoService.cantidadTotal$.subscribe(
      (cantidad) => {
        this.cantidadCarrito = cantidad;
      }
    )
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  ngOnDestroy(): void {
    this.carritoSub?.unsubscribe();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  abrirCarrito(): void {
    this.carritoVisible = true;
  }

}
