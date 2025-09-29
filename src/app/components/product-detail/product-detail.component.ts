import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent {
  product?: Product;
  imagesDisplay: string[] = [];
  selectedImage = '';
  relatedProducts: Product[] = [];
  zoomActive = false;
  zoomStyle: Record<string, string> = {};
  readonly whatsappNumber = APP_CONFIG.whatsappNumber;

  @ViewChild('mainImg', { static: false }) mainImg?: ElementRef<HTMLImageElement>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      void this.loadProduct();
    });
  }

  private async loadProduct(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      return;
    }

    const product = await this.productService.getProductByIdAsync(id);
    if (!product) {
      console.error('Producto no encontrado');
      return;
    }

    this.product = product;
    this.imagesDisplay = this.buildImagesDisplay(product);
    this.selectedImage = this.imagesDisplay[0] || product.image || '';

    const relatedFromCache = this.productService.getRelatedProducts(product.id);
    if (relatedFromCache.length) {
      this.relatedProducts = relatedFromCache;
    } else {
      const list = await this.productService.getProductsFromBackend();
      this.relatedProducts = list
        .filter(p => p.id !== product.id && this.normalize(p.category) === this.normalize(product.category))
        .slice(0, 3);
    }
  }

  toggleZoom(): void {
    this.zoomActive = !this.zoomActive;
  }

  onZoom(event: MouseEvent): void {
    if (!this.zoomActive || !this.mainImg) {
      return;
    }

    const rect = this.mainImg.nativeElement.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    this.zoomStyle = {
      'background-image': `url('${this.selectedImage || this.imagesDisplay[0] || ''}')`,
      'background-position': `${xPercent}% ${yPercent}%`,
      'background-size': '200%'
    };
  }

  resetZoom(): void {
    this.zoomStyle = {};
  }

  getQuoteHref(): string {
    const name = this.product?.name ?? '';
    const msg = `Hola, deseo mas informacion sobre el producto "${name}"`;
    const base = 'https://api.whatsapp.com/send';
    const params = new URLSearchParams({ phone: this.whatsappNumber, text: msg });
    return `${base}?${params.toString()}`;
  }

  getQuoteUrl(): string {
    const name = this.product?.name ?? '';
    const msg = `Hola, deseo más información sobre el producto "${name}"`;
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  private buildImagesDisplay(product: Product): string[] {
    const images: string[] = [];
    const main = product.image ? product.image : '';
    if (main) {
      images.push(main);
    }
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    return images;
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }
}
