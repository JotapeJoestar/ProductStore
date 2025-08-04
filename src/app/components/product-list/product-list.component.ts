import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ProductListComponent {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm = '';
  selectedCategory = '';
  maxPrice?: number;

  categories: string[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.products = this.productService.getProducts();
    this.categories = [...new Set(this.products.map(p => p.category))];
    this.filterProducts();
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory ? product.category === this.selectedCategory : true;
      const matchesPrice = this.maxPrice ? product.price <= this.maxPrice : true;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }

  viewDetails(productId: number): void { }

}
