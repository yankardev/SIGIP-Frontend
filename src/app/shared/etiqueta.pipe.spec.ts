import { EtiquetaPipe } from './etiqueta.pipe';

describe('EtiquetaPipe', () => {
  const pipe = new EtiquetaPipe();

  it('convierte los estados del backend en texto legible', () => {
    expect(pipe.transform('PAGO_EN_REVISION')).toBe('Pago en revisión');
    expect(pipe.transform('EN_PRODUCCION')).toBe('En producción');
    expect(pipe.transform('REGISTRADO')).toBe('Registrado');
  });

  it('devuelve vacío para valores nulos', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
