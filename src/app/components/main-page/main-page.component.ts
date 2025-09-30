import { Component, HostListener } from '@angular/core';
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
  featuredSlides: Product[][] = [];
  private currentChunkSize = 4;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const url = 'https://wa.me/?text=';
    this.whatsappLink = this.sanitizer.bypassSecurityTrustUrl(url);

    this.updateChunkSize();

    this.productService.getProductsFromBackend().then(list => {
      const featured = (list as any[]).filter(p => (p as any).featured);
      this.featured = featured.length ? (featured as Product[]) : list.slice(0, 8);
      this.updateSlides();
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateChunkSize(true);
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

  private updateSlides(): void {
    this.featuredSlides = this.chunkProducts(this.featured, this.currentChunkSize);
  }

  private updateChunkSize(reflow: boolean = false): void {
    if (typeof window === 'undefined') {
      this.currentChunkSize = 4;
      return;
    }

    const newSize = this.calculateChunkSize(window.innerWidth);
    if (newSize !== this.currentChunkSize) {
      this.currentChunkSize = newSize;
      if (reflow && this.featured.length) {
        this.updateSlides();
      }
    }
  }

  private calculateChunkSize(width: number): number {
    if (width < 768) {
      return 1;
    }
    if (width < 1200) {
      return 2;
    }
    return 4;
  }

  private chunkProducts(list: Product[], chunkSize: number): Product[][] {
    if (!list || !list.length) {
      return [];
    }
    const slides: Product[][] = [];
    for (let i = 0; i < list.length; i += chunkSize) {
      slides.push(list.slice(i, i + chunkSize));
    }
    return slides;
  }
}