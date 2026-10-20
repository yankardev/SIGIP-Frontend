import { Pipe, PipeTransform } from '@angular/core';

const ESPECIALES: Record<string, string> = {
  PAGO_EN_REVISION: 'Pago en revisión',
  EN_DISENO: 'En diseño',
  EN_PRODUCCION: 'En producción',
  EN_REVISION: 'En revisión',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Correo',
};

/** Convierte un valor de enum del backend (PAGO_EN_REVISION) en texto legible (Pago en revisión). */
@Pipe({ name: 'etiqueta' })
export class EtiquetaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    if (ESPECIALES[valor]) return ESPECIALES[valor];
    const texto = valor.replace(/_/g, ' ').toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
