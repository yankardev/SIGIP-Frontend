import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificadorService } from './core/notificador.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <div class="toasts" aria-live="polite">
      @for (aviso of notificador.avisos(); track aviso.id) {
        <div class="toast" [class.toast-error]="aviso.tipo === 'error'" (click)="notificador.cerrar(aviso.id)">
          {{ aviso.texto }}
        </div>
      }
    </div>
  `,
})
export class App {
  protected readonly notificador = inject(NotificadorService);
}
