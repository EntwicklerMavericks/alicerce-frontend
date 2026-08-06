import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NetworkService } from '../platform/network.service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const networkService = inject(NetworkService);

  if (!networkService.isOnline()) {
    console.warn('[OfflineInterceptor] Dispositivo sem conexão. Requisição adiada:', req.url);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!navigator.onLine || error.status === 0) {
        console.warn('[OfflineInterceptor] Erro de rede detectado:', req.url);
      }
      return throwError(() => error);
    })
  );
};
