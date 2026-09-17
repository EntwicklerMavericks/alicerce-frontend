import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RespostaResetWorkspace {
  sucesso: boolean;
  mensagem: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/workspaces`;

  resetarDadosWorkspace(workspaceId: string): Observable<RespostaResetWorkspace> {
    return this.http.post<RespostaResetWorkspace>(
      `${this.apiUrl}/${workspaceId}/resetar-dados`,
      {}
    );
  }
}
