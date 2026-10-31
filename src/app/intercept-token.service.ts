import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from './../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterceptTokenService implements HttpInterceptor {

  // Initialization

  constructor(private a: AuthService) { }

  // Methods

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Only our own user API gets the token. Sending it to a third party turns
    // a simple cross-origin GET into a preflighted one, which iTunes rejects,
    // and when logged out it used to send the literal string "JWT null".
    const token = this.a.getToken();

    if (token && request.url.startsWith(environment.userAPIBase)) {
      request = request.clone({
        setHeaders: {
          Authorization: `JWT ${token}`
        }
      });
    }

    // Pass the request on to the next handler
    return next.handle(request);
  }

}
