import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { CategoriaProducto } from '../../../core/models/categoria-producto';
import { CreateProductoRequest, ProductoResponse, UpdateProductoRequest } from '../../../core/models/producto';
import { CategoriaProductoService } from '../../../core/services/categoria-producto';
import { ProductoService } from '../../../core/services/producto';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
    TagModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  templateUrl: './carta.html',
  styleUrl: './carta.scss'
})
export class Carta implements OnInit {
  productos: ProductoResponse[] = [];
  categorias: CategoriaProducto[] = [];

  loading: boolean = false;
  submitting: boolean = false;
  showDialog: boolean = false;
  modalMode: 'create' | 'edit' = 'create';

  searchValue: string = '';
  selectedCategoria: CategoriaProducto | null = null;

  productoForm: FormGroup;
  currentProductoId: number | null = null;

  menuItems: MenuItem[] = [];
  selectedProducto: ProductoResponse | null = null;

  estadoOptions = [
    { label: 'Disponible', value: true },
    { label: 'Agotado / Inactivo', value: false }
  ];

  @ViewChild('dt') table!: Table;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaProductoService,
    private fb: FormBuilder
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      precio: [null, [Validators.required, Validators.min(0.5)]],
      imagenUrl: [''],
      idCategoria: [null, [Validators.required]],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.loadProductos();
    this.loadCategorias();
  }

  loadProductos(): void {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.loading = false;
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.table) this.table.filterGlobal(input.value, 'contains');
  }

  filterByCategoria(): void {
    if (this.table) {
      const valor = this.selectedCategoria ? this.selectedCategoria.nombre : null;
      this.table.filter(valor, 'categoriaProducto.nombre', 'equals');
    }
  }

  clearFilters(): void {
    if (this.table) this.table.clear();
    this.searchValue = '';
    this.selectedCategoria = null;
  }

  openCreateDialog(): void {
    this.modalMode = 'create';
    this.currentProductoId = null;
    this.productoForm.reset({
      estado: true,
      precio: null
    });
    this.showDialog = true;
  }

  openEditDialog(producto: ProductoResponse): void {
    this.modalMode = 'edit';
    this.currentProductoId = producto.idProducto;

    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagenUrl: producto.imagenUrl,
      idCategoria: producto.categoriaProducto.idCategoriaProducto,
      estado: producto.estado
    });
    this.showDialog = true;
  }

  saveProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.productoForm.value;

    if (this.modalMode === 'create') {
      const createRequest: CreateProductoRequest = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        precio: formValue.precio,
        imagenUrl: formValue.imagenUrl,
        estado: formValue.estado,
        idCategoriaProducto: formValue.idCategoria
      };

      this.productoService.create(createRequest).subscribe({
        next: () => this.handleSuccess('Producto creado correctamente'),
        error: (err) => this.handleError(err)
      });

    } else {
      const updateRequest: UpdateProductoRequest = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        precio: formValue.precio,
        imagenUrl: formValue.imagenUrl,
        estado: formValue.estado,
        idCategoriaProducto: formValue.idCategoria
      };

      this.productoService.update(this.currentProductoId!, updateRequest).subscribe({
        next: () => this.handleSuccess('Producto actualizado correctamente'),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(message: string): void {
    this.submitting = false;
    this.showDialog = false;
    this.loadProductos();
    Swal.fire('Éxito', message, 'success');
  }

  private handleError(error: any): void {
    this.submitting = false;
    console.error(error);
    Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
  }

  deleteProducto(producto: ProductoResponse): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `${producto.nombre} será eliminado del menú.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6f4e37'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.delete(producto.idProducto).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
            this.loadProductos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar (verifique ventas asociadas)', 'error')
        });
      }
    });
  }

  toggleMenu(menu: Menu, event: any, producto: ProductoResponse) {
    this.selectedProducto = producto;
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          { label: 'Editar', icon: 'pi pi-pencil', command: () => this.openEditDialog(producto) },
          { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.deleteProducto(producto) }
        ]
      }
    ];
    menu.toggle(event);
  }
}