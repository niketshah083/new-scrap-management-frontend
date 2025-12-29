import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        toastService.showError(
          'Access Denied',
          'You do not have permission to perform this action.'
        );
      } else if (error.status === 404) {
        toastService.showError('Not Found', error.error?.message || 'Resource not found.');
      } else if (error.status >= 500) {
        toastService.showError(
          'Server Error',
          'An unexpected error occurred. Please try again later.'
        );
      }

      return throwError(() => error);
    })
  );
};
