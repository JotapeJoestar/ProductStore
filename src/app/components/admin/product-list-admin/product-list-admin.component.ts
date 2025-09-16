import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-list-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list-admin.component.html',
  styleUrls: ['./product-list-admin.component.scss']
})
export class ProductListAdminComponent {
  products: Product[] = [];
  filtered: Product[] = [];

  // Filtros
  searchTerm = '';
  selectedCategory = '';
  selectedType = '';

  brandOptions = ['BMW', 'MERCEDES', 'MINI'];
  typeOptions = [
    'Motores y componentes',
    'Transmision y cajas de cambio',
    'Sistemas de frenado',
    'Sistemas de arranque',
    'Sistemas electronicos',
    'Aire acondicionado y climatizacion',
    'Frenos y pastillas',
    'Alternadores y generadores'
  ];

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.products = this.productService.getProducts();
    this.filterProducts();
  }

  edit(product: Product) {
    this.router.navigate(['/admin/product-edit', product.id]);
  }

  remove(product: Product) {
    const ok = confirm(`¿Seguro que deseas eliminar "${product.name}"?`);
    if (!ok) return;
    this.productService.deleteProduct(product.id);
    this.load();
  }

  filterProducts(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filtered = this.products.filter(p => {
      const matchesBrand = this.selectedCategory ? p.category.toLowerCase() === this.selectedCategory.toLowerCase() : true;
      const matchesType = this.selectedType ? p.type === this.selectedType : true;
      const matchesSearch = term ? (p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term)) : true;
      return matchesBrand && matchesType && matchesSearch;
    });
  }
}
