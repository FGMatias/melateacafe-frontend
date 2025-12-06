import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { CreateClienteRequest } from '../../../core/models/cliente';
import { DetallePedidoRequest } from '../../../core/models/detalle-pedido';
import { CreatePedidoRequest } from '../../../core/models/pedido';
import { TipoDocumento } from '../../../core/models/tipo-documento';
import { TipoPedido } from '../../../core/models/tipo-pedido';
import { CarritoService, ItemCarrito } from '../../../core/services/carrito';
import { ClienteService } from '../../../core/services/cliente';
import { EstadoPedidoService } from '../../../core/services/estado-pedido';
import { PedidoService } from '../../../core/services/pedido';
import { TipoDocumentoService } from '../../../core/services/tipo-documento';
import { TipoPedidoService } from '../../../core/services/tipo-pedido';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        SelectModule,
        TextareaModule
    ],
    templateUrl: './checkout.html',
    styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
    checkoutForm: FormGroup;
    items: ItemCarrito[] = [];
    subtotal: number = 0;
    deliveryCosto: number = 0;
    total: number = 0;

    tiposDocumento: TipoDocumento[] = [];
    tiposPedido: TipoPedido[] = [];

    submitting: boolean = false;
    loadingData: boolean = true;

    constructor(
        private fb: FormBuilder,
        private carritoService: CarritoService,
        private clienteService: ClienteService,
        private pedidoService: PedidoService,
        private tipoDocumentoService: TipoDocumentoService,
        private tipoPedidoService: TipoPedidoService,
        private estadoPedidoService: EstadoPedidoService,
        private router: Router
    ) {
        this.checkoutForm = this.fb.group({
            idTipoDocumento: [1, Validators.required],
            numeroDocumento: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
            nombres: ['', [Validators.required, Validators.minLength(2)]],
            apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
            apellidoMaterno: [''],
            telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
            email: ['', [Validators.required, Validators.email]],

            idTipoPedido: [3, Validators.required],
            direccion: [''],
            observaciones: ['']
        });
    }

    ngOnInit(): void {
        this.loadInitialData();

        this.carritoService.items$.subscribe(items => {
            this.items = items;
            if (items.length === 0) {
                this.router.navigate(['/menu']);
            }
        });

        this.carritoService.subtotal$.subscribe(subtotal => {
            this.subtotal = subtotal;
            this.calcularTotal();
        });

        this.checkoutForm.get('idTipoPedido')?.valueChanges.subscribe(idTipo => {
            this.onTipoPedidoChange(idTipo);
        });
    }

    loadInitialData(): void {
        this.loadingData = true;

        forkJoin({
            tiposDocumento: this.tipoDocumentoService.getAll(),
            tiposPedido: this.tipoPedidoService.getAll()
        }).subscribe({
            next: (data) => {
                this.tiposDocumento = data.tiposDocumento;
                this.tiposPedido = data.tiposPedido;
                this.loadingData = false;
            },
            error: (error) => {
                console.error('Error cargando datos iniciales:', error);
                this.loadingData = false;
                Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error');
            }
        });
    }

    onTipoPedidoChange(idTipoPedido: number): void {
        if (idTipoPedido === 2) {
            this.deliveryCosto = 5.00;
            this.checkoutForm.get('direccion')?.setValidators([Validators.required]);
        } else {
            this.deliveryCosto = 0;
            this.checkoutForm.get('direccion')?.clearValidators();
        }
        this.checkoutForm.get('direccion')?.updateValueAndValidity();
        this.calcularTotal();
    }

    calcularTotal(): void {
        this.total = this.subtotal + this.deliveryCosto;
    }

    getTipoDocumentoLabel(): string {
        const idTipo = this.checkoutForm.get('idTipoDocumento')?.value;
        const tipoDoc = this.tiposDocumento.find(t => t.idTipoDocumento === idTipo);
        return tipoDoc?.nombre || 'Documento';
    }

    procesarPedido(): void {
        if (this.checkoutForm.invalid) {
            this.checkoutForm.markAllAsTouched();
            Swal.fire('Formulario incompleto', 'Por favor complete todos los campos requeridos', 'warning');
            return;
        }

        if (this.items.length === 0) {
            Swal.fire('Carrito vacío', 'No hay productos en el carrito', 'warning');
            return;
        }

        this.submitting = true;
        const formValue = this.checkoutForm.value;

        this.clienteService.getByNumeroDocumento(formValue.numeroDocumento).pipe(
            catchError(() => {
                return of(null);
            }),
            switchMap(clienteExistente => {
                if (clienteExistente) {
                    return of(clienteExistente.idCliente);
                } else {
                    const nuevoCliente: CreateClienteRequest = {
                        idTipoDocumento: formValue.idTipoDocumento,
                        nombres: formValue.nombres,
                        apellidoPaterno: formValue.apellidoPaterno,
                        apellidoMaterno: formValue.apellidoMaterno || '',
                        numeroDocumento: formValue.numeroDocumento,
                        telefono: formValue.telefono,
                        email: formValue.email,
                        direccion: formValue.direccion || '',
                        estado: true
                    };

                    return this.clienteService.create(nuevoCliente).pipe(
                        switchMap(cliente => of(cliente.idCliente))
                    );
                }
            }),
            switchMap(idCliente => {
                const detalles: DetallePedidoRequest[] = this.items.map(item => ({
                    idProducto: item.producto.idProducto,
                    cantidad: item.cantidad,
                    observaciones: ''
                }));

                const pedidoRequest: CreatePedidoRequest = {
                    idCliente: idCliente,
                    idEstado: 1,
                    idTipoPedido: formValue.idTipoPedido,
                    direccionEntrega: formValue.direccion || undefined,
                    observaciones: formValue.observaciones || undefined,
                    deliveryCosto: this.deliveryCosto,
                    detalles: detalles
                };

                return this.pedidoService.create(pedidoRequest);
            })
        ).subscribe({
            next: (pedido) => {
                this.submitting = false;
                console.log('Pedido creado exitosamente:', pedido);

                this.carritoService.vaciarCarrito();

                Swal.fire({
                    icon: 'success',
                    title: '¡Pedido realizado!',
                    html: `
            <p class="text-lg">Tu pedido #${pedido.idPedido} ha sido registrado exitosamente.</p>
            <p class="text-gray-600 mt-2">Total: S/. ${this.total.toFixed(2)}</p>
          `,
                    confirmButtonText: 'Ir al inicio',
                    confirmButtonColor: '#6f4e37'
                }).then(() => {
                    this.router.navigate(['/']);
                });
            },
            error: (error) => {
                this.submitting = false;
                console.error('Error al procesar el pedido:', error);
                Swal.fire('Error', 'No se pudo procesar tu pedido. Por favor intenta nuevamente.', 'error');
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}