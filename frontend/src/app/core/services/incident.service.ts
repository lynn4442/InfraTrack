import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api/incidents';

  getAll(search = '', ordering = '-reported_date', severity = '') {
    let params = new HttpParams().set('ordering', ordering);
    if (search) params = params.set('search', search);
    if (severity) params = params.set('severity', severity);
    return this.http.get<any[]>(`${this.base}/`, { params });
  }

  getOne(id: string) {
    return this.http.get<any>(`${this.base}/${id}/`);
  }

  create(formData: FormData) {
    return this.http.post<any>(`${this.base}/`, formData);
  }

  update(id: string, formData: FormData) {
    return this.http.put<any>(`${this.base}/${id}/`, formData);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}/`);
  }
}
