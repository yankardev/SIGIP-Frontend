import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Diseno, DisenoRequest } from '../models';

/** design-service: versiones de diseño y aprobación del cliente. */
@Injectable({ providedIn: 'root' })
export class DisenoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/design-service/api/v1/disenos`;

  listar(idpedido?: number | null) {
    const params = idpedido ? new HttpParams().set('idpedido', idpedido) : undefined;
    return this.http.get<Diseno[]>(this.url, { params });
  }
  registrar(datos: DisenoRequest) {
    return this.http.post<Diseno>(this.url, datos);
  }
  actualizar(id: number, datos: DisenoRequest) {
    return this.http.put<Diseno>(`${this.url}/${id}`, datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  decidir(id: number, decision: 'APROBAR' | 'OBSERVAR', comentario: string) {
    return this.http.post<Diseno>(`${this.url}/${id}/decision`, { decision, comentario });
  }
}
