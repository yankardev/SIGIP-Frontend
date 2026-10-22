import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Dashboard as DatosDashboard, ESTADOS_PEDIDO } from '../../core/models';
import { ReportesService } from '../../core/services/reportes.service';
import { ClientesService } from '../../core/services/clientes.service';
import { VentasService } from '../../core/services/ventas.service';
import { NotificadorService } from '../../core/notificador.service';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe, RouterLink, EtiquetaPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly reportes = inject(ReportesService);
  private readonly clientesService = inject(ClientesService);
  private readonly ventas = inject(VentasService);
  private readonly notificador = inject(NotificadorService);

  protected readonly datos = signal<DatosDashboard | null>(null);
  protected readonly totalClientes = signal(0);
  protected readonly cotizacionesPendientes = signal(0);
  protected readonly cargando = signal(true);

  protected readonly porEstado = computed(() => {
    const mapa = this.datos()?.ventas?.pedidosPorEstado ?? {};
    const maximo = Math.max(1, ...Object.values(mapa));
    return ESTADOS_PEDIDO.map((estado) => ({ estado, cantidad: mapa[estado] ?? 0, ancho: ((mapa[estado] ?? 0) / maximo) * 100 }));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({ dashboard: this.reportes.dashboard(), clientes: this.clientesService.listar(), cotizaciones: this.ventas.cotizaciones() }).subscribe({
      next: ({ dashboard, clientes, cotizaciones }) => {
        this.datos.set(dashboard);
        this.totalClientes.set(clientes.filter((c) => c.activo).length);
        this.cotizacionesPendientes.set(cotizaciones.filter((c) => c.estado === 'SOLICITADA' || c.estado === 'COTIZADA').length);
        this.cargando.set(false);
      },
      error: (err) => { this.cargando.set(false); this.notificador.error(err, 'No se pudo cargar el tablero'); },
    });
  }
}
