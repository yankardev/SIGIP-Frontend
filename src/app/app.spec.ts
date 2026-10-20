import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { NotificadorService } from './core/notificador.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('crea la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra los mensajes emergentes del notificador', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(NotificadorService).ok('Pedido registrado');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.toast')?.textContent).toContain('Pedido registrado');
  });
});
