import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const timeoutDuration = req.url.includes('/upload/csv') ? 1800000 : 60000;

  return next(req).pipe(
    timeout(timeoutDuration)
  );
};
