import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriaProducto } from '../../../core/models/categoria-producto';
import { Producto } from '../../../core/models/producto';
import { CarritoService } from '../../../core/services/carrito';
import { CategoriaProductoService } from '../../../core/services/categoria-producto';
import { ProductoService } from '../../../core/services/producto';

interface Testimonial {
  id: number;
  nombre: string;
  comentario: string;
  calificacion: number;
}

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  categorias: CategoriaProducto[] = [];
  productosDestacados: Producto[] = [];

  loadingCategorias = true;
  loadingProductos = true;

  testimonials: Testimonial[] = [
    {
      id: 1,
      nombre: 'Carlos García',
      comentario: 'Excelente café y ambiente acogedor. Me encanta venir aquí a trabajar, el servicio es impecable y los productos son de primera calidad.',
      calificacion: 5
    },
    {
      id: 2,
      nombre: 'María Alva',
      comentario: 'El mejor café de la zona. La atención es personalizada y siempre me sorprenden con nuevas opciones del menú.',
      calificacion: 5
    },
    {
      id: 3,
      nombre: 'Carlos Rodríguez',
      comentario: 'Perfecto para estudiar. Wifi rápido, ambiente tranquilo y el café es delicioso. Los precios son justos para la calidad que ofrecen.',
      calificacion: 4
    }
  ];

  constructor(
    private productoService: ProductoService,
    private categoriaProductoService: CategoriaProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductosDestacados();
  }

  cargarCategorias(): void {
    this.loadingCategorias = true;
    this.categoriaProductoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter(c => c.estado);
        this.loadingCategorias = false;
        console.log('Categorias cargadas: ', this.categorias);
      },
      error: (error) => {
        console.log('Error al cargar las categorias:', error);
        this.loadingCategorias = false;
      }
    })
  }

  cargarProductosDestacados(): void {
    this.loadingProductos = true;
    this.productoService.getProductosDestacados().subscribe({
      next: (productos) => {
        this.productosDestacados = productos.filter(p => p.estado);
        this.loadingProductos = false;
        console.log('Productos destacados cargados: ', this.productosDestacados);
      },
      error: (error) => {
        console.log('Error al cargar los productos: ', error);
        this.loadingProductos = false;
      }
    })
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto, 1);
  }
}
