import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Dashboard as DatosDashboard } from '../../core/models';
import { ReportesService } from '../../core/services/reportes.service';
import { NotificadorService } from '../../core/notificador.service';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
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

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.reportes.dashboard().subscribe({
      next: (d) => { this.datos.set(d); this.cargando.set(false); },
      error: (err) => { this.cargando.set(false); this.notificador.error(err, 'No se pudo cargar el tablero'); },
    });
  }
}
