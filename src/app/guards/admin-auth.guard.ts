import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const ok = typeof localStorage !== 'undefined' && localStorage.getItem('admin_auth') === 'true';
    if (ok) return true;
    return this.router.parseUrl('/admin/login');
  }
}

