import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../../features/auth/store/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token();
  const workspace = authStore.workspaceAtivo();

  let headers = req.headers;

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/registro')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (workspace?.id) {
    headers = headers.set('X-Workspace-Id', workspace.id);
  }

  const clonedReq = req.clone({ headers });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        authStore.renovarToken();
      }
      return throwError(() => error);
    })
  );
};
