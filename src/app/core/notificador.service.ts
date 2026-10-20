import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './models';

export interface Aviso {
  id: number;
  tipo: 'ok' | 'error';
  texto: string;
}

/** Mensajes emergentes (toasts) de éxito y error. */
@Injectable({ providedIn: 'root' })
export class NotificadorService {
  private secuencia = 0;
  readonly avisos = signal<Aviso[]>([]);

  ok(texto: string): void {
    this.mostrar('ok', texto);
  }

  error(err: unknown, porDefecto = 'Ocurrió un error inesperado'): void {
    this.mostrar('error', mensajeDeError(err, porDefecto));
  }

  cerrar(id: number): void {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private mostrar(tipo: Aviso['tipo'], texto: string): void {
    const id = ++this.secuencia;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.cerrar(id), 5000);
  }
}

/** Convierte la respuesta de error del backend (ApiError) en un texto legible. */
export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error inesperado'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el API Gateway (¿está levantado en el puerto 8090?)';
    }
    const cuerpo = err.error as Partial<ApiError> | null;
    if (cuerpo && typeof cuerpo === 'object' && cuerpo.message) {
      return cuerpo.message;
    }
    if (err.status === 403) return 'No tiene permisos para esta operación';
    if (err.status === 503) return 'El servicio no está disponible en este momento';
  }
  return porDefecto;
}
