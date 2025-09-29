import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const has = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const expStr = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_expires') : null;
    let valid = !!has;
    if (valid && expStr) {
      const now = Date.now();
      const exp = Number(expStr);
      if (!isNaN(exp) && now > exp) { valid = false; }
    }
    const ok = valid;
    if (ok) return true;
    return this.router.parseUrl('/admin/login');
  }
}
