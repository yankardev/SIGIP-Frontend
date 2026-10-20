import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Dashboard } from '../../core/models';
import { ReportesService } from '../../core/services/reportes.service';
import { NotificadorService } from '../../core/notificador.service';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';

/** Reporte operativo consolidado por report-service; usa datos reales del backend. */
@Component({
  selector: 'app-reportes',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, EtiquetaPipe],
  templateUrl: './reportes.html',
})
export class Reportes implements OnInit {
  private readonly servicio = inject(ReportesService);
  private readonly notificador = inject(NotificadorService);

  protected readonly datos = signal<Dashboard | null>(null);
  protected readonly cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.dashboard().subscribe({
      next: (respuesta) => {
        this.datos.set(respuesta);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.notificador.error(error, 'No se pudieron cargar los reportes');
      },
    });
  }
}
