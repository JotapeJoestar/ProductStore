import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent {
  product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    category: '',
    type: '',
    image: '',
    images: []
  };

  constructor(private productService: ProductService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.product.id = Date.now(); 
      this.productService.addProduct(this.product);
      alert('Producto agregado con éxito');
      this.router.navigate(['/products']);
    }
  }
}
