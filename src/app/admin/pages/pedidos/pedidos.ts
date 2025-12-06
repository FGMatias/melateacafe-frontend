import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { PedidoResponse, UpdatePedidoRequest } from '../../../core/models/pedido';
import { PedidoService } from '../../../core/services/pedido';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    TagModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class Pedidos implements OnInit {
  pedidos: PedidoResponse[] = [];
  loading: boolean = false;

  searchValue: string = '';

  estadosFiltro = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Proceso', value: 'EN_PROCESO' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  showDetailDialog: boolean = false;
  selectedPedido: PedidoResponse | null = null;

  menuItems: MenuItem[] = [];

  @ViewChild('dt') table!: Table;

  constructor(private pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading = true;
    this.pedidoService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // --- VISUALES ---
  getSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" | undefined {
    switch (estado?.toUpperCase()) {
      case 'ENTREGADO': return 'success'; // Verde
      case 'EN_PROCESO': return 'info';   // Azul
      case 'PENDIENTE': return 'warn';    // Amarillo
      case 'CANCELADO': return 'danger';  // Rojo
      default: return 'secondary';
    }
  }

  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.table) this.table.filterGlobal(input.value, 'contains');
  }

  openDetail(pedido: PedidoResponse): void {
    this.selectedPedido = pedido;
    this.showDetailDialog = true;
  }

  actualizarEstado(pedido: PedidoResponse, idNuevoEstado: number): void {
    const request: UpdatePedidoRequest = {
      idEstado: idNuevoEstado
    };

    this.pedidoService.update(pedido.idPedido, request).subscribe({
      next: () => {
        this.showSuccess('Estado actualizado correctamente');
        this.loadPedidos();
      },
      error: () => this.showError('No se pudo actualizar el estado')
    });
  }

  cancelarPedido(pedido: PedidoResponse): void {
    Swal.fire({
      title: '¿Cancelar Pedido?',
      text: `El pedido #${pedido.idPedido} será cancelado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6f4e37',
      confirmButtonText: 'Sí, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.cancelar(pedido.idPedido).subscribe({
          next: () => {
            this.showSuccess('Pedido cancelado');
            this.loadPedidos();
          },
          error: () => this.showError('No se pudo cancelar el pedido')
        });
      }
    });
  }

  toggleMenu(menu: Menu, event: any, pedido: PedidoResponse) {
    const estado = pedido.estado.nombre.toUpperCase();

    this.menuItems = [
      {
        label: 'Ver Detalle',
        icon: 'pi pi-eye',
        command: () => this.openDetail(pedido)
      },
      { separator: true },
      {
        label: 'Marcar En Proceso',
        icon: 'pi pi-cog',
        visible: estado === 'PENDIENTE',
        command: () => this.actualizarEstado(pedido, 2)
      },
      {
        label: 'Marcar Entregado',
        icon: 'pi pi-check-circle',
        visible: estado === 'EN_PROCESO',
        command: () => this.actualizarEstado(pedido, 3)
      },
      {
        label: 'Cancelar',
        icon: 'pi pi-times-circle',
        styleClass: 'text-red-500',
        visible: estado !== 'CANCELADO' && estado !== 'ENTREGADO',
        command: () => this.cancelarPedido(pedido)
      }
    ];
    menu.toggle(event);
  }

  private showSuccess(msg: string) {
    Swal.fire({ icon: 'success', title: 'Éxito', text: msg, timer: 1500, showConfirmButton: false, confirmButtonColor: '#6f4e37' });
  }

  private showError(msg: string) {
    Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#6f4e37' });
  }
}