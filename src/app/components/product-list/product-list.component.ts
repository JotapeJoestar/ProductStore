import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  selectedType = '';
  maxPrice?: number;

  categories: string[] = [];
  types: string[] = [];

  brand: string | null = null;
  private initialized = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadProducts();

    this.route.paramMap.subscribe(params => {
      const paramBrand = params.get('brand');
      this.brand = paramBrand;
      this.selectedCategory = paramBrand ? paramBrand : '';
      this.filterProducts();
    });
  }

  private async loadProducts(): Promise<void> {
    const list = await this.productService.getProductsFromBackend();
    this.products = list.map(p => ({
      ...p,
      type: this.normalizeType(p.type)
    }));

    this.categories = [...new Set(this.products.map(p => p.category))];
    this.types = [
      'Motores y componentes',
      'Transmision y cajas de cambio',
      'Sistemas de frenado',
      'Sistemas de arranque',
      'Sistemas electronicos',
      'Aire acondicionado y climatizacion',
      'Frenos y pastillas',
      'Alternadores y generadores'
    ];

    this.filterProducts();
    this.initialized = true;
  }

  filterProducts(): void {
    if (!this.initialized) {
      return;
    }

    this.filteredProducts = this.products.filter(product => {
      const matchesBrand = this.selectedCategory ? product.category.toLowerCase() === this.selectedCategory.toLowerCase() : true;
      const term = this.searchTerm.trim().toLowerCase();
      const matchesSearch = term
        ? (product.name.toLowerCase().includes(term) || (product.description || '').toLowerCase().includes(term))
        : true;
      const matchesCategory = this.selectedCategory ? product.category === this.selectedCategory : true;
      const matchesType = this.selectedType ? product.type === this.selectedType : true;
      const matchesPrice = this.maxPrice ? product.price <= this.maxPrice : true;

      return matchesBrand && matchesSearch && matchesType && matchesPrice;
    });
  }

  viewDetails(productId: number): void {}

  private normalizeType(value: string): string {
    const v = (value || '').toLowerCase();
    if (v.includes('motor')) return 'Motores y componentes';
    if (v.includes('freno')) return 'Frenos y pastillas';
    if (v.includes('susp')) return 'Transmision y cajas de cambio';
    if (v.includes('electr')) return 'Sistemas electronicos';
    if (v.includes('carrocer')) return 'Aire acondicionado y climatizacion';
    if (v.includes('arranque')) return 'Sistemas de arranque';
    if (v.includes('aire') || v.includes('clima')) return 'Aire acondicionado y climatizacion';
    return value;
  }
}
