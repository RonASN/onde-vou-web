import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';
import {
  decodeJwtId,
  getExpiresAt,
  getToken,
  isExpired,
  removeExpiresAt,
  removeToken,
  saveExpiresAt,
  saveToken,
} from './jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(getToken());
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.token());

  constructor() {
    const token = getToken();
    const exp = getExpiresAt();
    if (token && isExpired(exp)) {
      this.logout();
      return;
    }
    if (token) {
      this.fetchCurrentUser().subscribe();
    }
  }

  login(dto: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/Usuario/login`, dto).pipe(
      tap((res) => {
        saveToken(res.token);
        saveExpiresAt(res.expiresAt);
        this.token.set(res.token);
      }),
      switchMap(() => this.fetchCurrentUser()),
    );
  }

  register(dto: RegisterRequest): Observable<User> {
    const credentials = { email: dto.email, senha: dto.senha };
    return this.http.post<User>(`${environment.apiUrl}/Usuario`, dto).pipe(
      switchMap(() => this.login(credentials)),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 409) {
          return this.login(credentials).pipe(catchError(() => throwError(() => err)));
        }
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    removeToken();
    removeExpiresAt();
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  fetchCurrentUser(): Observable<User> {
    const id = decodeJwtId(this.token()!);
    return this.http
      .get<User>(`${environment.apiUrl}/Usuario/${id}`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }
}
