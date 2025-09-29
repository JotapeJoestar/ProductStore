import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'
import { NgClass, CommonModule } from '@angular/common';
import { APP_CONFIG } from './config/app.config';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgClass, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isDarkMode = false;
  isAdminAuthed = false;
  navCollapsed = true;

  get whatsappHref(): string {
    // Usa API de WhatsApp que redirige a Web o App según el entorno
    const base = 'https://api.whatsapp.com/send';
    const params = new URLSearchParams({ phone: APP_CONFIG.whatsappNumber, text: APP_CONFIG.whatsappDefaultMessage });
    return `${base}?${params.toString()}`;
  }

  constructor(private router: Router) {
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        this.updateLayoutForRoute(ev.urlAfterRedirects);
        this.closeNavbar();
      }
    });
    // Evaluar layout también en la primera carga
    this.updateLayoutForRoute(this.router.url);
  }

  showLayout = true;

  private updateLayoutForRoute(url: string) {
    // Oculta navbar/footer solo en rutas que empiecen por /admin
    const isAdmin = /^\/admin(\/?|$)/.test(url);
    this.showLayout = !isAdmin;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const expStr = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_expires') : null;
    let valid = !!token;
    if (valid && expStr) {
      const now = Date.now(); const exp = Number(expStr); if (!isNaN(exp) && now > exp) valid = false;
    }
    this.isAdminAuthed = isAdmin && valid && url !== '/admin/login';
  }

  toggleNavbar(): void {
    this.navCollapsed = !this.navCollapsed;
  }

  closeNavbar(): void {
    this.navCollapsed = true;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  logout(): void {
    try { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_expires'); } catch {}
    this.isAdminAuthed = false;
    this.router.navigate(['/admin/login']);
  }
}
