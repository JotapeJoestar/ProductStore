import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent {
  product: Product | undefined;
  selectedImage: string | undefined;
  zoomStyle: any = {};

  @ViewChild('mainImg', { static: false }) mainImgRef!: ElementRef<HTMLImageElement>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product = this.productService.getProductById(id);
    if (this.product && this.product.images && this.product.images.length > 0) {
      this.selectedImage = this.product.images[0];
    }
  }

  sendToWhatsApp(): void {
    if (!this.product) return;
    const message = `Hola, estoy interesado en el producto: ${this.product.name} que cuesta $${this.product.price}`;
    const phone = '573243667373';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  zoomActive = false;

  @ViewChild('mainImg', { static: false }) mainImg!: ElementRef;

  toggleZoom(): void {
    this.zoomActive = !this.zoomActive;
  }

  onZoom(event: MouseEvent): void {
    if (!this.zoomActive || !this.mainImg) return;

    const rect = this.mainImg.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    this.zoomStyle = {
      'background-image': `url('${this.selectedImage || this.product?.images[0]}')`,
      'background-position': `${xPercent}% ${yPercent}%`,
      'background-size': '200%'
    };
  }

  resetZoom(): void {
    this.zoomStyle = {};
  }

}
