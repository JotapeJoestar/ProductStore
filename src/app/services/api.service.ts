import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  private buildUrl(endpoint: string): string {
    const base = APP_CONFIG.backendBaseUrl?.replace(/\/$/, '') ?? '';
    const ep = endpoint.replace(/^\//, '');
    return `${base}/${ep}`;
  }

  async request<T = any>(endpoint: string, method: Method, body?: any, token?: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const resolvedToken = token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') ?? undefined : undefined);
    const headers: HttpHeaders = new HttpHeaders(
      resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}
    );
    switch (method) {
      case 'GET':
        return await firstValueFrom(this.http.get<T>(url, { headers }));
      case 'POST':
        return await firstValueFrom(this.http.post<T>(url, body, { headers }));
      case 'PUT':
        return await firstValueFrom(this.http.put<T>(url, body, { headers }));
      case 'DELETE':
        return await firstValueFrom(this.http.delete<T>(url, { headers }));
      default:
        throw new Error('Unsupported method');
    }
  }

  get<T = any>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, 'GET', undefined, token);
  }
  post<T = any>(endpoint: string, body: any, token?: string) {
    return this.request<T>(endpoint, 'POST', body, token);
  }
  put<T = any>(endpoint: string, body: any, token?: string) {
    return this.request<T>(endpoint, 'PUT', body, token);
  }
  delete<T = any>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, 'DELETE', undefined, token);
  }
}
