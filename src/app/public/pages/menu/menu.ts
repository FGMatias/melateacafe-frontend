import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CategoriaProducto } from '../../../core/models/categoria-producto';
import { ProductoResponse } from '../../../core/models/producto';
import { CarritoService } from '../../../core/services/carrito';
import { CategoriaProductoService } from '../../../core/services/categoria-producto';
import { ProductoService } from '../../../core/services/producto';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit {
  categorias: CategoriaProducto[] = [];
  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  productosPaginados: ProductoResponse[] = [];

  loadingCategorias = true;
  loadingProductos = true;

  categoriaSeleccionada: number | null = null;
  precioMinimo: number = 0;
  precioMaximo: number = 100;
  busqueda: string = '';

  paginaActual: number = 1;
  productosPorPagina: number = 20;
  totalPaginas: number = 0;

  constructor(
    private categoriaService: CategoriaProductoService,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.loadingCategorias = true;
    this.categoriaService.getAll().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter((c) => c.estado);
        this.loadingCategorias = false;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.loadingCategorias = false;
      },
    });
  }

  cargarProductos(): void {
    this.loadingProductos = true;
    this.productoService.getActivos().subscribe({
      next: (productos: ProductoResponse[]) => {
        this.productos = productos;
        this.loadingProductos = false;
        console.log('Productos cargados:', this.productos.length);
        this.aplicarFiltros();
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.loadingProductos = false;
      }
    });
  }

  seleccionarCategoria(idCategoria: number | null): void {
    this.categoriaSeleccionada = idCategoria;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  buscarProductos(): void {
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let productosFiltrados = [...this.productos];

    if (this.categoriaSeleccionada) {
      productosFiltrados = productosFiltrados.filter(
        (p) => p.categoriaProducto.idCategoriaProducto === this.categoriaSeleccionada
      );
    }

    productosFiltrados = productosFiltrados.filter(
      (p) => p.precio >= this.precioMinimo && p.precio <= this.precioMaximo
    );

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busquedaLower) ||
          p.descripcion?.toLowerCase().includes(busquedaLower)
      );
    }

    this.productosFiltrados = productosFiltrados;
    this.calcularPaginacion();
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(
      this.productosFiltrados.length / this.productosPorPagina
    );

    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    this.productosPaginados = this.productosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.calcularPaginacion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get paginasVisibles(): number[] {
    const maxPaginas = 5;
    const mitad = Math.floor(maxPaginas / 2);
    let inicio = Math.max(1, this.paginaActual - mitad);
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);

    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  limpiarFiltros(): void {
    this.categoriaSeleccionada = null;
    this.precioMinimo = 0;
    this.precioMaximo = 100;
    this.busqueda = '';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  agregarAlCarrito(producto: ProductoResponse): void {
    this.carritoService.agregarProducto(producto, 1);
  }
}