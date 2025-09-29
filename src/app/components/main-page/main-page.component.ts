import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  phoneNumber: string = '573132567020';
  defaultMessage: string = 'Hola, me gustaria conocer el catalogo';
  whatsappLink!: SafeUrl;
  featured: Product[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const url = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.defaultMessage)}`;
    this.whatsappLink = this.sanitizer.bypassSecurityTrustUrl(url);

    this.productService.getProductsFromBackend().then(list => {
      const featured = (list as any[]).filter(p => (p as any).featured);
      this.featured = featured.length ? (featured as Product[]) : list.slice(0, 6);
    });
  }

  goToBrand(brand: string) {
    this.router.navigate(['/products', brand]);
  }

  openProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  goToAll() {
    this.router.navigate(['/products']);
  }
}
