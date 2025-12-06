import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { CarouselModule } from 'primeng/carousel';
import { Producto, ProductoResponse } from '../../../core/models/producto';
import { CarritoService } from '../../../core/services/carrito';
import { ProductoService } from '../../../core/services/producto';

interface Testimonial {
  id: number;
  nombre: string;
  comentario: string;
  calificacion: number;
}

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterLink, CarouselModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit, AfterViewInit {
  productosDestacados: ProductoResponse[] = [];

  loadingCategorias = true;
  loadingProductos = true;

  responsiveOptions: any[] = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1220px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

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
    private carritoService: CarritoService
  ) { }

  ngOnInit(): void {
    this.loadingProductos = true;
    this.productoService.getDestacados().subscribe({
      next: (productos: ProductoResponse[]) => {
        this.productosDestacados = productos.filter((p: ProductoResponse) => p.estado);
        this.loadingProductos = false;
        console.log('Productos destacados cargados:', this.productosDestacados.length);
      },
      error: (error: any) => {
        console.error('Error cargando destacados', error);
        this.loadingProductos = false;
      }
    });
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto, 1);
  }

  ngAfterViewInit(): void {
    this.initMapa();
  }

  initMapa(): void {
    const coordenadas: L.LatLngTuple = [-11.886729198165341, -77.03574616239975];

    const mapContainer = L.DomUtil.get('mapa-leaflet');
    if (mapContainer && (mapContainer as any)._leaflet_id) {
      return;
    }

    const mapa = L.map('mapa-leaflet', {
      center: coordenadas,
      zoom: 17,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapa);

    const cafeIcon = L.icon({
      iconUrl: 'images/logo.webp',
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50],
    });

    L.marker(coordenadas, { icon: cafeIcon })
      .addTo(mapa)
      .bindPopup(
        '<b>Me Late a Café</b><br>Av. Mariana Condesmarca 808<br>¡Te esperamos!',
      )
      .openPopup();
  }
}