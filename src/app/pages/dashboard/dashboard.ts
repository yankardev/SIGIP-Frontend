import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Dashboard as DatosDashboard, ESTADOS_PEDIDO } from '../../core/models';
import { ReportesService } from '../../core/services/reportes.service';
import { NotificadorService } from '../../core/notificador.service';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe, RouterLink, EtiquetaPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly reportes = inject(ReportesService);
  private readonly notificador = inject(NotificadorService);

  protected readonly datos = signal<DatosDashboard | null>(null);
  protected readonly cargando = signal(true);
  protected readonly esComercial = computed(() => this.auth.esAdmin() || this.auth.tieneRol('VENTAS'));
  protected readonly esOperativo = computed(() => this.auth.esAdmin() || this.auth.tieneRol('OPERACIONES'));

  protected readonly porEstado = computed(() => {
    const mapa = this.datos()?.ventas?.pedidosPorEstado ?? {};
    const maximo = Math.max(1, ...Object.values(mapa));
    return ESTADOS_PEDIDO.map((estado) => ({ estado, cantidad: mapa[estado] ?? 0, ancho: ((mapa[estado] ?? 0) / maximo) * 100 }));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.reportes.dashboard().subscribe({
      next: (d) => { this.datos.set(d); this.cargando.set(false); },
      error: (err) => { this.cargando.set(false); this.notificador.error(err, 'No se pudo cargar el tablero'); },
    });
  }
}
