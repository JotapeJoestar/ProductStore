import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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

  constructor(private router: Router, private location: Location) {}

  onSubmit(f: NgForm) {
    this.error = '';
    if (!f.valid) return;
    // Demo: credenciales fijas
    const DEMO_USER = 'admin';
    const DEMO_PASS = 'admin123';
    const ok = (this.username === DEMO_USER && this.password === DEMO_PASS);
    if (!ok) {
      this.error = 'Credenciales inválidas';
      return;
    }
    localStorage.setItem('admin_auth', 'true');
    this.router.navigate(['/admin/products']);
  }

  goBack() { this.location.back(); }
}
