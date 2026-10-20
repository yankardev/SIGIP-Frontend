import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Dashboard } from '../models';

/** report-service: tablero consolidado del administrador. */
@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/report-service/api/v1/reportes`;

  dashboard() {
    return this.http.get<Dashboard>(`${this.url}/dashboard`);
  }
}
