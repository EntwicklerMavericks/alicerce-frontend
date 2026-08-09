import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResult } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  obterDashboard(competencia?: string): Observable<DashboardResult> {
    let params = new HttpParams();
    if (competencia) {
      params = params.set('competencia', competencia).set('referenceDate', competencia);
    }
    return this.http.get<DashboardResult>(this.baseUrl, { params });
  }
}
