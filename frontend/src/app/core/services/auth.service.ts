import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api/auth';

  login(username: string, password: string) {
    return this.http.post<{ access: string; refresh: string }>(`${this.base}/login/`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
      })
    );
  }

  register(username: string, password: string) {
    return this.http.post(`${this.base}/register/`, { username, password });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }
}
