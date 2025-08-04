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
  zoomActive = false;
  zoomStyle: any = {};

  @ViewChild('mainImg', { static: false }) mainImgRef!: ElementRef<HTMLImageElement>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

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

  onZoom(event: MouseEvent): void {
    if (!this.mainImgRef) return;
    const img = this.mainImgRef.nativeElement;
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const lensSize = 120;
    const left = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    const top = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));

    this.zoomStyle = {
      left: `${left}px`,
      top: `${top}px`,
      width: `${lensSize}px`,
      height: `${lensSize}px`,
      backgroundImage: `url('${this.selectedImage}')`,
      backgroundSize: `${rect.width * 2}px ${rect.height * 2}px`,
      backgroundPosition: `-${left * 2}px -${top * 2}px`
    };
    this.zoomActive = true;
  }

  resetZoom(): void {
    this.zoomActive = false;
  }
}
