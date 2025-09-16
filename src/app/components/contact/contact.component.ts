import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  name = '';
  phone = '';
  email = '';
  message = '';

  submitting = false;
  submitted = false;

  submit() {
    this.submitting = true;
    // Simulate submit; in real app, send to backend or email service
    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
      this.name = '';
      this.phone = '';
      this.email = '';
      this.message = '';
    }, 500);
  }
}

