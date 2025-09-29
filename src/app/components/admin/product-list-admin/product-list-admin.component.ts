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

  searchTerm = '';
  selectedCategory = 'Todas';
  selectedType = 'Todos';

  brandOptions = ['Todas', 'BMW', 'MERCEDES', 'MINI'];
  typeOptions = [
    'Todos',
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
    void this.load();
  }

  async load() {
    this.products = await this.productService.getProductsFromBackend();
    this.filterProducts();
  }

  edit(product: Product) {
    this.router.navigate(['/admin/product-edit', product.id]);
  }

  async onRemove(product: Product) {
    const ok = window.confirm('Eliminar "' + product.name + '"?');
    if (!ok) return;
    await this.productService.deleteProductAsync(product.id);
    await this.load();
  }

filterProducts(): void {
  const term = this.searchTerm.trim().toLowerCase();
  const selected = this.selectedCategory.trim().toLowerCase();
  const selectedIsUniversal = !selected || selected === 'todos' || selected === 'todas';

  this.filtered = this.products.filter(p => {
    const brand = (p.category || '').trim().toLowerCase();

    const matchesBrand =
      selectedIsUniversal ||
      brand === selected ||
      brand === 'todas' ||
      brand === 'todos';

    const matchesType =
      !this.selectedType ||
      this.selectedType === 'Todos' ||
      p.type === this.selectedType ||
      p.type === 'Todos';

    const matchesSearch = term
      ? (p.name.toLowerCase().includes(term) ||
         (p.description || '').toLowerCase().includes(term))
      : true;

    return matchesBrand && matchesType && matchesSearch;
  });
}

}
