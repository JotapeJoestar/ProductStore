import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router, private location: Location, private api: ApiService) {}

  onSubmit(f: NgForm) {
    this.error = '';
    if (!f.valid) return;
    const body = { username: this.username, password: this.password };
    this.api.post<any>('login', body)
      .then(res => {
        const token = res?.token;
        const exp = res?.expires_in;
        if (!token) { throw new Error('Token no recibido'); }
        try {
          localStorage.setItem('auth_token', token);
          if (exp) localStorage.setItem('auth_expires', String(Date.now() + (Number(exp) * 1000)));
        } catch {}
        this.router.navigate(['/admin/products']);
      })
      .catch(() => {
        this.error = 'Credenciales invalidas';
      });
  }

  goBack() { this.location.back(); }
}
