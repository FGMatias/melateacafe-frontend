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
import { EstadoMesa } from '../../../core/models/estado-mesa';
import { Mesa } from '../../../core/models/mesa';
import { EstadoMesaService } from '../../../core/services/estado-mesa';
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
  estados: EstadoMesa[] = [];

  loading: boolean = false;
  submitting: boolean = false;
  showDialog: boolean = false;
  modalMode: 'create' | 'edit' = 'create';

  searchValue: string = '';
  selectedEstado: EstadoMesa | null = null;

  mesaForm: FormGroup;
  currentMesaId: number | null = null;

  menuItems: MenuItem[] = [];
  selectedMesa: Mesa | null = null;

  @ViewChild('dt') table!: Table;

  constructor(
    private mesaService: MesaService,
    private estadoMesaService: EstadoMesaService,
    private fb: FormBuilder
  ) {
    this.mesaForm = this.fb.group({
      numero: [null, [Validators.required, Validators.min(1)]], // Es Integer en Java
      capacidad: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      idEstadoMesa: [null, [Validators.required]] // Control del select
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.mesaService.getAll().subscribe({
      next: (data) => {
        this.mesas = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    this.estadoMesaService.getAll().subscribe(data => this.estados = data);
  }

  getSeverity(nombreEstado: string): "success" | "info" | "warn" | "danger" | "secondary" | undefined {
    const estado = nombreEstado?.toUpperCase();
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
      const valor = this.selectedEstado ? this.selectedEstado.nombre : null;
      this.table.filter(valor, 'estadoMesa.nombre', 'equals');
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

    const estadoInicial = this.estados.find(e => e.nombre.toUpperCase() === 'DISPONIBLE')?.idEstadoMesa;

    this.mesaForm.reset({
      capacidad: 4,
      idEstadoMesa: estadoInicial
    });
    this.showDialog = true;
  }

  openEditDialog(mesa: Mesa): void {
    this.modalMode = 'edit';
    this.currentMesaId = mesa.idMesa;

    this.mesaForm.patchValue({
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      idEstadoMesa: mesa.estadoMesa.idEstadoMesa,
    });
    this.showDialog = true;
  }

  saveMesa(): void {
    if (this.mesaForm.invalid) {
      this.mesaForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.mesaForm.value;

    const mesaDTO = {
      numero: formValue.numero,
      capacidad: formValue.capacidad,
      idEstado: formValue.idEstadoMesa
    };

    const request$ = this.modalMode === 'create'
      ? this.mesaService.create(mesaDTO)
      : this.mesaService.update(this.currentMesaId!, mesaDTO);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.showDialog = false;
        this.loadData();
        Swal.fire('Éxito', `Mesa ${this.modalMode === 'create' ? 'creada' : 'actualizada'} correctamente`, 'success');
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar la mesa', 'error');
      }
    });
  }

  deleteMesa(mesa: Mesa): void {
    Swal.fire({
      title: '¿Eliminar mesa?',
      text: `Mesa N° ${mesa.numero}.`,
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
            this.loadData();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar (posiblemente tenga pedidos)', 'error')
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