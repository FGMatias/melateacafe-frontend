import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { CategoriaProducto } from '../../../core/models/categoria-producto';
import { CategoriaProductoService } from '../../../core/services/categoria-producto';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DialogModule,
    TagModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss'
})
export class Categorias implements OnInit {
  categorias: CategoriaProducto[] = [];
  loading: boolean = false;
  submitting: boolean = false;

  showDialog: boolean = false;
  modalMode: 'create' | 'edit' = 'create';

  searchValue: string = '';
  selectedEstado: any | null = null;
  estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  categoriaForm: FormGroup;
  currentCategoriaId: number | null = null;

  menuItems: MenuItem[] = [];
  selectedCategoria: CategoriaProducto | null = null;

  @ViewChild('dt') table!: Table;

  constructor(
    private categoriaService: CategoriaProductoService,
    private fb: FormBuilder
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading = true;
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.table) this.table.filterGlobal(input.value, 'contains');
  }

  filterByEstado(): void {
    if (this.table) {
      const valor = this.selectedEstado ? this.selectedEstado.value : null;
      this.table.filter(valor, 'estado', 'equals');
    }
  }

  clearFilters(): void {
    if (this.table) this.table.clear();
    this.searchValue = '';
    this.selectedEstado = null;
  }

  openCreateDialog(): void {
    this.modalMode = 'create';
    this.currentCategoriaId = null;
    this.categoriaForm.reset({ estado: true });
    this.showDialog = true;
  }

  openEditDialog(categoria: CategoriaProducto): void {
    this.modalMode = 'edit';
    this.currentCategoriaId = categoria.idCategoriaProducto;
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado
    });
    this.showDialog = true;
  }

  saveCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.categoriaForm.value;

    const categoriaDTO = { ...formValue };

    const request$ = this.modalMode === 'create'
      ? this.categoriaService.create(categoriaDTO)
      : this.categoriaService.update(this.currentCategoriaId!, categoriaDTO);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.showDialog = false;
        this.loadCategorias();
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Categoría ${this.modalMode === 'create' ? 'creada' : 'actualizada'} correctamente`,
          confirmButtonColor: '#6f4e37',
          timer: 2000
        });
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        Swal.fire('Error', err.error?.message || 'No se pudo guardar la categoría', 'error');
      }
    });
  }

  deleteCategoria(categoria: CategoriaProducto): void {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Se eliminará la categoría "${categoria.nombre}". Si tiene productos asociados, esto podría fallar o quedar inconsistente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6f4e37',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.delete(categoria.idCategoriaProducto).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La categoría ha sido eliminada', 'success');
            this.loadCategorias();
          },
          error: (err) => {
            Swal.fire('No se pudo eliminar', 'Es posible que existan productos asociados a esta categoría.', 'error');
          }
        });
      }
    });
  }

  toggleMenu(menu: Menu, event: any, categoria: CategoriaProducto) {
    this.selectedCategoria = categoria;
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => this.openEditDialog(categoria)
          },
          {
            label: 'Eliminar',
            icon: 'pi pi-trash',
            styleClass: 'text-red-500',
            command: () => this.deleteCategoria(categoria)
          }
        ]
      }
    ];
    menu.toggle(event);
  }
}