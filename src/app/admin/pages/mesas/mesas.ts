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
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { Mesa } from '../../../core/models/mesa';
import { MesaService } from '../../../core/services/mesa';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
    TagModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  templateUrl: './mesas.html',
  styleUrl: './mesas.scss'
})
export class Mesas implements OnInit {
  mesas: Mesa[] = [];
  loading: boolean = false;
  submitting: boolean = false;

  showDialog: boolean = false;
  modalMode: 'create' | 'edit' = 'create';

  searchValue: string = '';
  selectedEstado: any | null = null;

  estadoOptions = [
    { label: 'Disponible', value: 'DISPONIBLE' },
    { label: 'Ocupada', value: 'OCUPADA' },
    { label: 'Reservada', value: 'RESERVADA' },
    { label: 'Mantenimiento', value: 'MANTENIMIENTO' }
  ];

  mesaForm: FormGroup;
  currentMesaId: number | null = null;

  menuItems: MenuItem[] = [];
  selectedMesa: Mesa | null = null;

  @ViewChild('dt') table!: Table;

  constructor(
    private mesaService: MesaService,
    private fb: FormBuilder
  ) {
    this.mesaForm = this.fb.group({
      numeroMesa: ['', [Validators.required, Validators.maxLength(10)]],
      capacidad: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      estado: ['DISPONIBLE', [Validators.required]],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.loadMesas();
  }

  loadMesas(): void {
    this.loading = true;
    this.mesaService.getAll().subscribe({
      next: (data) => {
        this.mesas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (estado) {
      case 'DISPONIBLE': return 'success';
      case 'OCUPADA': return 'danger';
      case 'RESERVADA': return 'warn';
      case 'MANTENIMIENTO': return 'secondary';
      default: return 'info';
    }
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
    this.currentMesaId = null;
    this.mesaForm.reset({
      capacidad: 4,
      estado: 'DISPONIBLE'
    });
    this.showDialog = true;
  }

  openEditDialog(mesa: Mesa): void {
    this.modalMode = 'edit';
    this.currentMesaId = mesa.idMesa;
    this.mesaForm.patchValue({
      numeroMesa: mesa.numero,
      capacidad: mesa.capacidad,
      estado: mesa.estado,
    });
    this.showDialog = true;
  }

  saveMesa(): void {
    if (this.mesaForm.invalid) {
      this.mesaForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const mesaDTO = this.mesaForm.value;

    const request$ = this.modalMode === 'create'
      ? this.mesaService.create(mesaDTO)
      : this.mesaService.update(this.currentMesaId!, mesaDTO);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.showDialog = false;
        this.loadMesas();
        Swal.fire('Éxito', `Mesa ${this.modalMode === 'create' ? 'creada' : 'actualizada'} correctamente`, 'success');
      },
      error: (err) => {
        this.submitting = false;
        Swal.fire('Error', 'No se pudo guardar la mesa', 'error');
      }
    });
  }

  deleteMesa(mesa: Mesa): void {
    Swal.fire({
      title: '¿Eliminar mesa?',
      text: `Mesa N° ${mesa.numero}. Si tiene pedidos activos, no se podrá eliminar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6f4e37'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mesaService.delete(mesa.idMesa).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La mesa ha sido eliminada', 'success');
            this.loadMesas();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la mesa', 'error')
        });
      }
    });
  }

  toggleMenu(menu: Menu, event: any, mesa: Mesa) {
    this.selectedMesa = mesa;
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          { label: 'Editar', icon: 'pi pi-pencil', command: () => this.openEditDialog(mesa) },
          { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.deleteMesa(mesa) }
        ]
      }
    ];
    menu.toggle(event);
  }
}