import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ESTADOS_PEDIDO, EstadoPedido, Pedido } from '../../core/models';
import { VentasService } from '../../core/services/ventas.service';
import { NotificadorService } from '../../core/notificador.service';
import { EstadoBadge } from '../../shared/estado-badge';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';

/** Lista de pedidos: el cliente ve los suyos y el administrador todos, con filtro por estado. */
@Component({
  selector: 'app-pedidos',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, EstadoBadge, EtiquetaPipe],
  templateUrl: './pedidos.html',
})
export class Pedidos implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly ventas = inject(VentasService);
  private readonly notificador = inject(NotificadorService);

  protected readonly estados = ESTADOS_PEDIDO;
  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly cargando = signal(true);
  protected filtro: EstadoPedido | '' = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.ventas.pedidos(this.filtro).subscribe({
      next: (lista) => {
        this.pedidos.set([...lista].sort((a, b) => b.idpedido - a.idpedido));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificador.error(err, 'No se pudieron cargar los pedidos');
      },
    });
  }
}
