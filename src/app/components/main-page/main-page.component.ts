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
  defaultMessage: string = 'Hola, me gustaría conocer el catálogo';
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

    this.featured = this.productService.getFeaturedProducts();
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
