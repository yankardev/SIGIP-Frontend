import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from './notificador.service';

describe('mensajeDeError', () => {
  it('usa el mensaje del ApiError del backend', () => {
    const err = new HttpErrorResponse({
      status: 409,
      error: { status: 409, error: 'BUSINESS_RULE', message: 'Solo se puede modificar un pedido en estado REGISTRADO' },
    });
    expect(mensajeDeError(err)).toBe('Solo se puede modificar un pedido en estado REGISTRADO');
  });

  it('explica cuando el gateway no responde', () => {
    expect(mensajeDeError(new HttpErrorResponse({ status: 0 }))).toContain('API Gateway');
  });

  it('traduce 403 aunque no haya cuerpo', () => {
    expect(mensajeDeError(new HttpErrorResponse({ status: 403 }))).toBe('No tiene permisos para esta operación');
  });
});
