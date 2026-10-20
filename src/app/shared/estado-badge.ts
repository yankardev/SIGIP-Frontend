import { Component, computed, input } from '@angular/core';
import { EtiquetaPipe } from './etiqueta.pipe';

const TONOS: Record<string, string> = {
  REGISTRADO: 'neutro', PENDIENTE: 'neutro', BAJA: 'neutro', SISTEMA: 'neutro',
  PAGO_EN_REVISION: 'aviso', EN_REVISION: 'aviso', OBSERVADO: 'aviso', OBSERVADA: 'aviso', MEDIA: 'aviso', ENVIADA: 'aviso',
  CONFIRMADO: 'info', EN_DISENO: 'info', EN_PRODUCCION: 'info', EN_PROCESO: 'info',
  TERMINADO: 'ok', ENTREGADO: 'ok', APROBADO: 'ok', VERIFICADO: 'ok', TERMINADA: 'ok', LEIDA: 'ok', ENTRADA: 'ok',
  CANCELADO: 'peligro', RECHAZADO: 'peligro', ALTA: 'peligro', SALIDA: 'peligro',
  REEMPLAZADO: 'apagado',
};

/** Etiqueta de color para estados, prioridades y tipos. */
@Component({
  selector: 'app-estado',
  imports: [EtiquetaPipe],
  template: `<span class="badge" [class]="'badge badge-' + tono()">{{ valor() | etiqueta }}</span>`,
})
export class EstadoBadge {
  readonly valor = input.required<string>();
  readonly tono = computed(() => TONOS[this.valor()] ?? 'neutro');
}
